import { useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';


export default function EventDetails() {
  const [isDeleting, setisDeleting] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  });

  const { mutate, isPending: isPendingDeletion, isError: isErrorDeleting, error: deletingError } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      });
      navigate('/events');
    }
  });

  function startDeleteHandler() {
    setisDeleting(true);
  }

  function stopDeleteHandler() {
    setisDeleting(false);
  }

  function DeleteHandler() {
    mutate({ id: params.id });
  }

  let content;

  if (isPending) {
    content = <div id='event-details-content' className='center'>
      <p>Fetching event data...</p>
    </div>;
  }

  if (isError) {
    content = <div id='event-details-content' className='center'>
      <ErrorBlock title='An error occured while fetching details.' message={error.info?.message || 'An error occured while fetching details.'} />
    </div>;
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    content =
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={startDeleteHandler}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>;
      </>;

  }



  return (
    <>
      {isDeleting && <Modal onClose={stopDeleteHandler}>
        <h2>Are you sure ? </h2>
        <p>Do you really want to delete this event ? This action cannot be changed.</p>
        {isPendingDeletion && <p style={{ color: 'red' }}>Deleting, please wait....</p>}

        {!isPendingDeletion && <div className='form-actions'>
          <button onClick={stopDeleteHandler} className='button-text'>Cancel</button>
          <button onClick={DeleteHandler} className='button'>Delete</button>
        </div>}
        {isErrorDeleting && <ErrorBlock title='An error occured while deleting event' message={deletingError.info?.message || 'An error occured while deleting event, please try again later.'} />}
      </Modal>}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}
