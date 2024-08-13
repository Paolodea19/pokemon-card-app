// src/CardComponent.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Pagination } from 'react-bootstrap';
import debounce from 'lodash.debounce';

const CardComponent = () => {
  const [cards, setCards] = useState([]);           // Stato per memorizzare l'array di carte
  const [searchTerm, setSearchTerm] = useState(''); // Stato per memorizzare il termine di ricerca
  const [loading, setLoading] = useState(true);     // Stato per indicare il caricamento
  const [error, setError] = useState(null);         // Stato per gestire eventuali errori
  const [page, setPage] = useState(1);              // Stato per la pagina corrente
  const [totalPages, setTotalPages] = useState(1);  // Stato per il numero totale di pagine
  const [selectedCard, setSelectedCard] = useState(null); // Stato per la card selezionata
  const [showModal, setShowModal] = useState(false); // Stato per la visibilità del modal
  const [searching, setSearching] = useState(false); // Stato per indicare se stiamo cercando

  // Costanti per gestire la paginazione
  const pagesToShow = 10; // Numero massimo di pagine da mostrare nella paginazione

  // Funzione per il caricamento iniziale e per la paginazione
  useEffect(() => {
    if (!searching) {
      const fetchCardData = async () => {
        setLoading(true);
        try {
          let headersList = {
            "Accept": "*/*",
            "User-Agent": "Thunder Client (https://www.thunderclient.com)"
          };

          let reqOptions = {
            url: `https://api.pokemontcg.io/v2/cards?page=${page}&pageSize=12`,
            method: "GET",
            headers: headersList,
          };

          let response = await axios.request(reqOptions);

          if (response.data.data.length > 0) {
            setCards(response.data.data); // Memorizza tutte le carte ottenute
            setTotalPages(Math.ceil(response.data.totalCount / 12)); // Calcola il numero totale di pagine
          } else {
            setError('No card data found'); // Gestisce il caso in cui non ci siano dati
          }
        } catch (err) {
          setError(err.message); // Memorizza l'errore in caso di fallimento della richiesta
        } finally {
          setLoading(false); // Disabilita lo stato di caricamento dopo aver completato la richiesta
        }
      };

      fetchCardData(); // Chiama la funzione asincrona
    }
  }, [page, searching]); // La chiamata API si esegue ogni volta che la pagina cambia o la ricerca termina

  // Funzione di ricerca con debounce
  const debouncedSearch = debounce(async (searchTerm) => {
    if (searchTerm.length > 1) { // Esegui la ricerca solo se il termine è lungo almeno 2 caratteri
      setLoading(true);
      setSearching(true);
      try {
        let headersList = {
          "Accept": "*/*",
          "User-Agent": "Thunder Client (https://www.thunderclient.com)"
        };

        let reqOptions = {
          url: `https://api.pokemontcg.io/v2/cards?q=name:"${searchTerm}"`,
          method: "GET",
          headers: headersList,
        };

        let response = await axios.request(reqOptions);

        if (response.data.data.length > 0) {
          setCards(response.data.data); // Memorizza tutte le carte ottenute dalla ricerca
          setTotalPages(1); // Imposta le pagine a 1 durante la ricerca
        } else {
          setError('No cards found matching your search'); // Gestisce il caso in cui non ci siano dati
          setCards([]); // Reset delle carte se non ci sono risultati
        }
      } catch (err) {
        setError(err.message); // Memorizza l'errore in caso di fallimento della richiesta
      } finally {
        setLoading(false); // Disabilita lo stato di caricamento dopo aver completato la richiesta
      }
    } else if (searchTerm === '') {
      setSearching(false); // Disabilita lo stato di ricerca se il termine di ricerca è vuoto
      setPage(1); // Resetta la pagina alla prima
    }
  }, 300); // 300 ms debounce

  // Gestore per aggiornare il termine di ricerca
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value); // Chiama la funzione di ricerca con debounce
  };

  // Gestore per cambiare la pagina
  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  // Gestore per aprire il modal con la card selezionata
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  // Gestore per chiudere il modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  if (loading) return <div>Loading...</div>; // Mostra un messaggio di caricamento mentre la richiesta è in corso
  if (error) return <div>Error: {error}</div>; // Mostra un messaggio di errore in caso di problemi

  const showPagination = !searching && totalPages > 1; // Mostra la paginazione solo se non stiamo cercando e ci sono più di una pagina

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-12">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search for a card..." 
            value={searchTerm} 
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="row">
        {cards.map((card, index) => (
          <div className="col-md-4 mb-4" key={index}>
            <div className="card" style={{ width: '18rem', cursor: 'pointer' }} onClick={() => handleCardClick(card)}>
              <img src={card.images.large} className="card-img-top" alt={card.name} />
              <div className="card-body">
                <h5 className="card-title">{card.name}</h5>
                <p className="card-text">{card.flavorText || "No description available."}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showPagination && (
        <div className="row">
          <div className="col-12">
            <Pagination className="justify-content-center">
              <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
              <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
              {Array.from({ length: Math.min(totalPages, pagesToShow) }, (v, k) => k + 1).map(num => (
                <Pagination.Item
                  key={num}
                  active={num === page}
                  onClick={() => handlePageChange(num)}
                >
                  {num}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
              <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
            </Pagination>
          </div>
        </div>
      )}

      {/* Modal per visualizzare la card ingrandita */}
      {selectedCard && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{selectedCard.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img src={selectedCard.images.large} className="img-fluid" alt={selectedCard.name} />
            <p className="mt-3">{selectedCard.flavorText || "No description available."}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default CardComponent;
