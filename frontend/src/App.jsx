import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Topics from './pages/Topics';
import ConsumerGroups from './pages/ConsumerGroups';
import Acl from './pages/Acl';
import Search from './pages/Search';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Topics />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/groups" element={<ConsumerGroups />} />
          <Route path="/acls" element={<Acl />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;