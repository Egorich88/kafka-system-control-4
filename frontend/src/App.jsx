import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Topics from './pages/Topics';
import Groups from './pages/Groups';
import Acl from './pages/Acl';
import Search from './pages/Search';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Topics />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/acls" element={<Acl />} />
          <Route path="/search" element={<Search />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;