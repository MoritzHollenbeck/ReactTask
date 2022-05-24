import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
import romantic from './emmafreund.png'
import keinsinn from './keinsinn.png'
//import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import { logDOM } from '@testing-library/dom';

const initialFormState = { name: '', description: '' }

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if (note.image) {
        const image = await Storage.get(note.image);
        note.image = image;
      }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name === "hakuna matata" || !formData.name === "Hakuna Matata") return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }

  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  }

  return (
    <div className="App">
      <h1>Hallo Emma </h1>
      <h2>Leben macht manchmal kein sinn frag nich wieso ...</h2>
      <img src={keinsinn} alt="Logo" />;
      <h2>Aber dann ist wieder allet jut hakuna matata</h2>
      <img src={romantic} alt="Logo" />;
      <div>ruf mal die nummer an, wenn du dich traust ... zitter nich</div>
      <div>015256434915</div>
      <div style={{marginBottom: 30}}>
      {
  notes.map(note => (
    <div key={note.id || note.name}>
      <h2>Danke Emma, jetzt gehts mir wieder besser! ruf mal hier an </h2>
      <img src={keinsinn} alt="Logo" />;
      <button onClick={() => deleteNote(note)}>Nochmal ausprobieren!</button>
      {
        note.image && <img src={note.image} style={{width: 400}} />
      }
    </div>
  ))
}
      </div>
      
    </div>
  );
}

//export default withAuthenticator(App);
export default App;
//      <AmplifySignOut />
