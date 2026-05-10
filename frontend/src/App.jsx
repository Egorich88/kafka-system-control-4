import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Topics from './pages/Topics';
import Groups from './pages/Groups';
import Acl from './pages/Acl';
import Search from './pages/Search';
import { ClusterProvider } from './contexts/ClusterContext';
import './App.css';

function App() {
  return (
    <ClusterProvider>
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
    </ClusterProvider>
  );
}

export default App;