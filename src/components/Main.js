import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";

//components
import MovieModal from "./MovieModal";

//api
const api = "https://www.omdbapi.com/?";

//api key
const apiKey = "apikey=e9bfe59f";

const Main = ({ darkMode, toggleMode }) => {
  const [name, setName] = useState("");
  const [movies, setMovies] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [movieDetails, setMovieDetails] = useState({});
  const [message, setMessage] = useState('');
  const [cache, setCache] = useState({});

  //modal
  const [show, setShow] = useState(false);

  //pagination
  const [totalResults, setTotalResults] = useState(0);
  const [numberOfPages, setNumberOfPages] = useState();
  const [currentPage, setCurrentPage] = useState();

  // filtering
  const [filterGenre, setFilterGenre] = useState('');

  const genres = ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi"];

  const getNumberOfPages = useCallback(() => {
    if (totalResults % 10 > 0) {
      const numberOfpages = parseInt(totalResults / 10 + 1);
      setNumberOfPages(numberOfpages);
      return;
    }
    const numberOfpages = parseInt(totalResults / 10);
    setNumberOfPages(numberOfpages);
  }, [totalResults]);

  //modal config
  const showModal = () => {
    setShow(true);
  };

  const hideModal = () => {
    setShow(false);
    setMovieDetails({});
  };

  //get response from API
  const getInfo = debounce((pageNumber) => {
    if (pageNumber) {
      axios
        .get(
          `${api}${apiKey}&s=${name}&type=movie&page=${pageNumber}`
        )
        .then((res) => {
          if (res.data.Response === "True") {
            const moviePromises = res.data.Search.map(movie => {
              if (cache[movie.imdbID]) {
                return Promise.resolve(cache[movie.imdbID]);
              } else {
                return axios.get(`${api}${apiKey}&i=${movie.imdbID}`).then(res => {
                  setCache(prevCache => ({ ...prevCache, [movie.imdbID]: res.data }));
                  return res.data;
                });
              }
            });

            Promise.all(moviePromises).then(moviesWithDetails => {
              setMovies(moviesWithDetails);
              setTotalResults(res.data.totalResults);
              setMessage('');
            });
          } else {
            setMovies([]);
            setMessage('No movie found for the search term');
          }
        });
      return;
    }
    axios
      .get(`${api}${apiKey}&s=${name}&type=movie&page=1`)
      .then((res) => {
        if (res.data.Response === "True") {
          const moviePromises = res.data.Search.map(movie => {
            if (cache[movie.imdbID]) {
              return Promise.resolve(cache[movie.imdbID]);
            } else {
              return axios.get(`${api}${apiKey}&i=${movie.imdbID}`).then(res => {
                setCache(prevCache => ({ ...prevCache, [movie.imdbID]: res.data }));
                return res.data;
              });
            }
          });

          Promise.all(moviePromises).then(moviesWithDetails => {
            setMovies(moviesWithDetails);
            setTotalResults(res.data.totalResults);
            setCurrentPage(1);
            setMessage('');
          });
        } else {
          setMovies([]);
          setMessage('No movie found for the search term');
        }
      });
  }, 300);

  //get details
  const getDetails = (e, id) => {
    e.preventDefault();

    setSelectedId(id);
    if (cache[id]) {
      setMovieDetails(cache[id]);
      showModal();
    } else {
      axios.get(`${api}${apiKey}&i=${id}`).then((res) => {
        if (res) {
          setCache(prevCache => ({ ...prevCache, [id]: res.data }));
          setMovieDetails(res.data);
          showModal();
        }
      });
    }
  };

  //submit the title entered
  const handleSubmit = (e) => {
    e.preventDefault();
    getInfo();
  };

  //getnumberOFpageseffect
  useEffect(() => {
    getNumberOfPages();
  }, [totalResults, getNumberOfPages]);

  const pages = [];

  for (let i = 1; i <= numberOfPages; i++) {
    pages.push(
      <p key={i} onClick={() => goTo(i)}>
        {i}
      </p>
    );
  }

  const goTo = (pageNumber) => {
    setCurrentPage(pageNumber);
    getInfo(pageNumber);
    window.scrollTo(0, 0);
  };

  const filteredMoviesMemo = useMemo(() => {
    let filtered = movies;

    if (filterGenre) {
      filtered = filtered.filter(movie => movie.Genre && movie.Genre.includes(filterGenre));
    }

    return filtered;
  }, [movies, filterGenre]);

  return (
    <div className={darkMode ? 'dark-mode' : 'light-mode'}>
      <form>
        <div className='searchBar'>
          {/* <label htmlFor='movieName'>Movie Name</label> */}
          <input
            type='text'
            id='movieName'
            name='name'
            placeholder='movie name'
            autoComplete='off'
            onChange={(e) => setName(e.target.value)}
          />
          <button type='submit' onClick={(e) => handleSubmit(e)}>
            Search
          </button>
        </div>
      </form>

      <div className='filter-container'>
        <label htmlFor='genreFilter'>Filter by Genre</label>
        <select id='genreFilter' onChange={(e) => setFilterGenre(e.target.value)}>
          <option value="">Select Genre</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>

      {message && <p>{message}</p>}

      {filteredMoviesMemo.length > 0 ? (
        <div className='movies'>
          {filteredMoviesMemo.map((movie) => (
            <div key={movie.imdbID} className='movie'>
              <img src={movie.Poster} alt='' />
              <div className='movie-title'>
                <p>{movie.Title}</p>
              </div>
              <button
                className='movie-detailsBtn'
                onClick={(e) => getDetails(e, movie.imdbID)}
              >
                Details
              </button>

              {/* modal */}
              {movieDetails && selectedId === movie.imdbID && show ? (
                <MovieModal
                  movieInfo={movieDetails}
                  handleClose={hideModal}
                />
              ) : (
                <div className='modal display-none'></div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No movies found for the selected genre.</p>
      )}

      {numberOfPages ? (
        <div className='pages'>
          {/* if prev page is 0 it wont show */}
          {currentPage - 1 === 0 ? null : (
            <b onClick={() => goTo(currentPage - 1)}>{currentPage - 1}</b>
          )}
          <b onClick={() => goTo(currentPage)} className='actualPage'>
            {currentPage}
          </b>
          <b onClick={() => goTo(currentPage + 1)}>{currentPage + 1}</b>
        </div>
      ) : null}
    </div>
  );
};

export default Main;