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

      getImages(searchText, 1)
        .then(data => {
          if (data.totalHits === 0) {
            handleNoImagesFound();
          }
          if (data.totalHits <= 12) {
            handleEndOfSearchResults();
          }
          if (data.status === 'error') {
            return Promise.reject(data.message);
          } else if (data.totalHits > 0) {
            setIsLoading(false);
            Notiflix.Notify.success(
              `Hooray! We found ${data.totalHits} images.`
            );
          }
          const imgArr = transformImageData(data);
          setImages(imgArr);
        })
        .catch(error => {
          setError({ error });
        });
    }
  }, [searchText]);

  useEffect(() => {
    if (page !== 1) {
      setIsLoading(true);

      getImages(searchText, page)
        .then(data => {
          if (data.totalHits === 0) {
            handleEndOfSearchResults();
          }

          if (Math.floor(data.totalHits / page) < 12) {
            handleEndOfSearchResults();
          }

          const imgArr = transformImageData(data);

          setImages(prevState => [...prevState, ...imgArr]);
        })
        .catch(error => {
          setError(error);
        });
    }
  }, [page, searchText]);

  // componentDidUpdate(prevProps, prevState) {
  //   const searchText = this.state.searchText.trim();

  //   if (prevState.searchText !== searchText && searchText) {
  //     this.setState({ isLoading: true, page: 1 });

  //     getImages(searchText, 1)
  //       .then(data => {
  //         if (data.totalHits === 0) {
  //           this.handleNoImagesFound();
  //         }
  //         if (data.totalHits <= 12) {
  //           this.handleEndOfSearchResults();
  //         }
  //         if (data.status === 'error') {
  //           return Promise.reject(data.message);
  //         } else if (data.totalHits > 0) {
  //           this.setState({ isLoading: false });
  //           Notiflix.Notify.success(
  //             `Hooray! We found ${data.totalHits} images.`
  //           );
  //         }
  //         const imgArr = this.transformImageData(data);
  //         this.setState({
  //           images: imgArr,
  //         });
  //       })
  //       .catch(error => {
  //         this.setState({ error });
  //       });
  //   }

  //   if (prevState.page !== this.state.page && this.state.page !== 1) {
  //     this.setState({ isLoading: true });
  //     getImages(searchText, this.state.page)
  //       .then(data => {
  //         if (data.totalHits === 0) {
  //           this.handleNoImagesFound();
  //         }
  //         if (Math.floor(data.totalHits / this.state.page) < 12) {
  //           this.handleEndOfSearchResults();
  //         }

  //         const imgArr = this.transformImageData(data);
  //         this.setState(prevState => ({
  //           images: [...prevState.images, ...imgArr],
  //         }));
  //       })
  //       .catch(error => {
  //         this.setState({ error });
  //       });
  //   }
  // }

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
