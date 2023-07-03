import { useState, useEffect } from 'react';
import Notiflix from 'notiflix';
import Button from './Button/Button';
import Loader from './Loader/Loader';
import { Searchbar } from './Searchbar/Searchbar';
import { Container } from './App.styled';
import { Modal } from './Modal/Modal';
import { getImages } from './Api/api';
import { ImageGallery } from './ImageGallery/ImageGallery';

export const App = () => {
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [per_page] = useState(12);
  const [largeImage, setLargeImage] = useState(null);

  const createSearchText = search => {
    setSearchText(search);
    setPage(1);
  };

  const handleNoImagesFound = () => {
    setIsLoading(false);
    Notiflix.Notify.info(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  };

  const handleEndOfSearchResults = () => {
    setIsLoading(false);
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  };

  const transformImageData = data => {
    return data.hits.map(({ id, tags, webformatURL, largeImageURL }) => ({
      id,
      tags,
      webformatURL,
      largeImageURL,
    }));
  };

  useEffect(() => {
    if (searchText) {
      setIsLoading(true);

      getImages(searchText, page)
        .then(data => {
          if (data.totalHits === 0) {
            handleNoImagesFound();
          }

          if (data.totalHits <= 12 || Math.floor(data.totalHits / page) < 12) {
            handleEndOfSearchResults();
          }

          if (data.status === 'error') {
            return Promise.reject(data.message);
          } else if (data.totalHits > 0 && page === 1) {
            setIsLoading(false);
            Notiflix.Notify.success(
              `Hooray! We found ${data.totalHits} images.`
            );
          }

          const imgArr = transformImageData(data);
          if (page === 1) {
            setImages(imgArr);
          } else {
            setImages(prevState => [...prevState, ...imgArr]);
          }
        })
        .catch(error => {
          setError({ error });
        });
    }
  }, [searchText, page]);

  const nextPage = () => {
    setPage(prevState => prevState + 1);
    setIsLoading(true);
  };

  const openModal = e => {
    const largeImage = e.target.dataset.large;

    if (e.target.nodeName === 'IMG') {
      setShowModal(true);
      setLargeImage(largeImage);
    }
  };

  const toggleModal = () => {
    setShowModal(false);
  };

  const onButtonVisible = () => {
    if (images && images.length < Number(page * per_page)) {
      return false;
    } else return true;
  };

  return (
    <Container>
      <Searchbar onSubmit={createSearchText} />
      {isLoading && <Loader />}
      {error && `${error}`}
      {images && <ImageGallery images={images} openModal={openModal} />}
      {onButtonVisible() && <Button nextPage={nextPage} />}
      {showModal && <Modal onClose={toggleModal} largeImage={largeImage} />}
    </Container>
  );
};
