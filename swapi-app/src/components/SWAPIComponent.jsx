import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SWAPIComponent.css';

function SWAPIComponent() {
  const [planets, setPlanets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [planetResidents, setPlanetResidents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationDisabled, setPaginationDisabled] = useState(false);
  const [viewResidents, setViewResidents] = useState(false);

  useEffect(() => {
    const fetchPlanets = async () => {
      try {
        const response = await axios.get(`https://swapi.dev/api/planets/?page=${currentPage}`);
        setPlanets(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 planets per page
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanets();
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const fetchResidents = async (planet) => {
    try {
      const residentPromises = planet.residents.map((residentUrl) => axios.get(residentUrl));
      const residentResponses = await Promise.all(residentPromises);
      const residentsData = residentResponses.map((response) => response.data);
      setPlanetResidents(residentsData);
      setSelectedPlanet(planet);
      setPaginationDisabled(true);
      setViewResidents(true);
    } catch (error) {
      console.error('Error fetching residents:', error);
    }
  };

  const handleCloseResidents = () => {
    setViewResidents(false);
    setSelectedPlanet(null);
    setPaginationDisabled(false);
  };

  return (
    <div className="swapi-container">
      <h1 className="title">Star Wars Planets</h1>
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error.message}</div>}
      <div className="planet-grid">
        {planets.map((planet, index) => (
          <div key={index} className={`planet-card${selectedPlanet === planet ? ' active' : ''}`}>
            <h2>{planet.name}</h2>
            <p>
              <strong>Climate:</strong> {planet.climate}
            </p>
            <p>
              <strong>Terrain:</strong> {planet.terrain}
            </p>
            <p>
              <strong>Population:</strong> {planet.population}
            </p>
            <p>
              <strong>Gravity:</strong> {planet.gravity}
            </p>
            {viewResidents && selectedPlanet === planet ? (
              <div className="planet-residents">
                <h3>Residents of {selectedPlanet.name}</h3>
                <ul>
                  {planetResidents.length > 0 ? (
                    planetResidents.map((resident, index) => (
                      <li key={index}>
                        <strong>Name:</strong> {resident.name},{' '}
                        <strong>Height:</strong> {resident.height},{' '}
                        <strong>Mass:</strong> {resident.mass},{' '}
                        <strong>Gender:</strong> {resident.gender}
                      </li>
                    ))
                  ) : (
                    <li>No residents found</li>
                  )}
                </ul>
                <button onClick={handleCloseResidents}>Close</button>
              </div>
            ) : (
              <button onClick={() => fetchResidents(planet)}>
                {selectedPlanet === planet ? 'Close' : 'View Residents'}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1 || paginationDisabled}>
          Previous
        </button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages || paginationDisabled}>
          Next
        </button>
      </div>
    </div>
  );
}

export default SWAPIComponent;
