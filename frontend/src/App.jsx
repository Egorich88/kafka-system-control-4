/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Topics from './pages/Topics';
import Groups from './pages/Groups';
import Acl from './pages/Acl';
import Search from './pages/Search';
import Settings from './pages/Settings';
import { ClusterProvider } from './contexts/ClusterContext';

function App() {
  return (
    <ClusterProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="overview" element={<Overview />} />
            <Route path="topics" element={<Topics />} />
            <Route path="groups" element={<Groups />} />
            <Route path="acls" element={<Acl />} />
            <Route path="search" element={<Search />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ClusterProvider>
  );
}

export default App;