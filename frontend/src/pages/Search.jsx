/* * Copyright 2026 Egor Khomenko (Egorich88) * * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. * You may obtain a copy of the License at * * http://www.apache.org/licenses/LICENSE-2.0 * * Unless required by applicable law or agreed to in writing, software * distributed under the License is distributed on an "AS IS" BASIS, * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. * See the License for the specific language governing permissions and * limitations under the License. */
 import {
   FiChevronDown,
   FiChevronUp,
   FiSearch
 } from 'react-icons/fi';
 import '../styles/Search.css';
 import {
     useEffect, useState
}
 from 'react';
 import {
     useSearchParams
}
 from 'react-router-dom';
 import axios from 'axios';
 import toast, {
     Toaster
}
 from 'react-hot-toast';
 import {
     useCluster
}
 from '../contexts/ClusterContext';
 export default function Search() {
     const {
         currentCluster
    }
     = useCluster();
     const [searchParams, setSearchParams] = useSearchParams();
     const [topics, setTopics] = useState([]);
     const [loadingTopics, setLoadingTopics] = useState(false);
     const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '');
     const [partition, setPartition] = useState(searchParams.get('partition') || '0');
     const [offset, setOffset] = useState('0');
     const [limit, setLimit] = useState('10');
     const [messages, setMessages] = useState([]);
     const [searching, setSearching] = useState(false);
     useEffect(() => {
         if (!currentCluster) return;
         const loadTopics = async () => {
             setLoadingTopics(true);
             try {
                 const response = await axios.get('/api/topics', {
                     headers: {
                         'X-Kafka-Bootstrap': currentCluster.brokers
                    }
                }
                );
                 let topicsList = response.data.topics || [];
                 if (topicsList.length > 0 && typeof topicsList[0] === 'object') {
                     topicsList = topicsList.map(t => t.name);
                }
                 setTopics(topicsList);
            }
             catch (err) {
                 toast.error('Ошибка загрузки топиков: ' + err.message);
            }
             finally {
                 setLoadingTopics(false);
            }
        }
        ;
         loadTopics();
    }
    , [currentCluster]);
     useEffect(() => {
         if (selectedTopic) {
             setSearchParams({
                 topic: selectedTopic, partition
            }
            );
        }
         else {
             setSearchParams({
            }
            );
        }
    }
    , [selectedTopic, partition, setSearchParams]);
     const handleSearch = async (e) => {
         e.preventDefault();
         if (!selectedTopic) {
             toast.error('Выберите топик');
             return;
        }
         if (!currentCluster) {
             toast.error('Нет активного кластера');
             return;
        }
         setSearching(true);
         try {
             const url = `/api/topics/${
                encodeURIComponent(selectedTopic)
            }
            /messages?partition=${
                partition
            }
            &offset=${
                offset
            }
            &limit=${
                limit
            }
            `;
             const response = await axios.get(url, {
                 headers: {
                     'X-Kafka-Bootstrap': currentCluster.brokers
                }
            }
            );
             setMessages(response.data.messages || []);
             toast.success(`Получено ${
                response.data.messages?.length || 0
            }
             сообщений`);
        }
         catch (err) {
             toast.error('Ошибка чтения сообщений: ' + (err.response?.data?.error || err.message));
             setMessages([]);
        }
         finally {
             setSearching(false);
        }
    }
    ;
     const [isTopicDropdownOpen, setIsTopicDropdownOpen] =
       useState(false);

     const [topicSearch, setTopicSearch] =
       useState('');

     const filteredTopics = topics.filter(topic =>
       topic.toLowerCase().includes(
         topicSearch.toLowerCase()
       )
     );
     return ( <div className="search-page"> <Toaster position="top-right" /> <div className="search-header"> <div> <h1>Поиск сообщений</h1> <p> Kafka Message Explorer </p> </div> </div> <div className="search-toolbar-card"> <form className="search-toolbar" onSubmit={
        handleSearch
    }
     > <div className="search-field"> <label>Топик</label> <div className="topic-dropdown-wrapper">

                                                             <button
                                                               type="button"
                                                               className={`topic-dropdown-trigger ${
                                                                 isTopicDropdownOpen ? 'open' : ''
                                                               }`}
                                                               onClick={() =>
                                                                 setIsTopicDropdownOpen(
                                                                   !isTopicDropdownOpen
                                                                 )
                                                               }
                                                             >

                                                               <span className="topic-dropdown-value">

                                                                 {selectedTopic || 'Выберите топик'}

                                                               </span>

                                                               <div className="topic-dropdown-chevron">

                                                                 {isTopicDropdownOpen ? (
                                                                   <FiChevronUp />
                                                                 ) : (
                                                                   <FiChevronDown />
                                                                 )}

                                                               </div>

                                                             </button>

                                                             {isTopicDropdownOpen && (

                                                               <div className="topic-dropdown-menu">

                                                                 <div className="topic-dropdown-search">

                                                                   <FiSearch />

                                                                   <input
                                                                     type="text"
                                                                     placeholder="Поиск топика..."
                                                                     value={topicSearch}
                                                                     onChange={(e) =>
                                                                       setTopicSearch(e.target.value)
                                                                     }
                                                                   />

                                                                 </div>

                                                                 <div className="topic-dropdown-list">

                                                                   {filteredTopics.map(topic => (

                                                                     <div
                                                                       key={topic}
                                                                       className={`topic-dropdown-item ${
                                                                         selectedTopic === topic
                                                                           ? 'active'
                                                                           : ''
                                                                       }`}
                                                                       onClick={() => {

                                                                         setSelectedTopic(topic);

                                                                         setIsTopicDropdownOpen(false);

                                                                         setTopicSearch('');
                                                                       }}
                                                                     >

                                                                       {topic}

                                                                     </div>

                                                                   ))}

                                                                 </div>

                                                               </div>

                                                             )}

                                                           </div> </div> <div className="search-field"> <label>Партиция</label> <input type="number" value={
        partition
    }
     onChange={
        (e) => setPartition(e.target.value)
    }
     min="0" /> </div> <div className="search-field"> <label>Offset</label> <input type="number" value={
        offset
    }
     onChange={
        (e) => setOffset(e.target.value)
    }
     min="0" /> </div> <div className="search-field"> <label>Limit</label> <input type="number" value={
        limit
    }
     onChange={
        (e) => setLimit(e.target.value)
    }
     min="1" max="1000" /> </div> <button type="submit" className="search-submit-btn" disabled={
         searching || !selectedTopic || !currentCluster
    }
     > {
        searching ? 'Поиск...' : 'Найти сообщения'
    }
     </button> </form> </div> {
        messages.length > 0 && ( <div className="search-results-card"> <div className="search-results-header"> <h2>Результаты поиска</h2> <div className="search-results-count"> {
            messages.length
        }
         сообщений </div> </div> <div className="messages-grid"> {
            messages.map((msg, idx) => ( <div key={
                idx
            }
             className="message-card" > <div className="message-meta"> <span> Offset: {
                msg.offset
            }
             </span> <span> {
                msg.timestamp
            }
             </span> </div> <div className="message-key"> <strong>Key:</strong> <code> {
                msg.key || '—'
            }
             </code> </div> <div className="message-value"> <strong>Value:</strong> <pre> {
                msg.value
            }
             </pre> </div> </div> ))
        }
         </div> </div> )
    }
     </div> );
}
