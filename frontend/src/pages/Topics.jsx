// Topics.jsx (новая версия)
import { useEffect, useState } from 'react';
import { useCluster } from '../contexts/ClusterContext';
import { useKafkaFetch } from '../hooks/useKafkaFetch'; // создадим
import TopicsList from '../components/TopicsList';
import TopicDetails from '../components/TopicDetails';
import CreateTopicModal from '../components/CreateTopicModal';
import toast, { Toaster } from 'react-hot-toast';

export default function Topics() {
  const { currentCluster } = useCluster();
  const kafkaFetch = useKafkaFetch();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadTopics = async () => {
    if (!currentCluster) return;
    setLoading(true);
    try {
      const data = await kafkaFetch('/api/topics');
      setTopics(data.topics || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, [currentCluster]);

  const handleTopicCreated = () => {
    loadTopics();
    setShowCreateModal(false);
  };

  const handleTopicDeleted = (topicName) => {
    if (selectedTopic === topicName) setSelectedTopic(null);
    loadTopics();
  };

  return (
    <div className="topics-page">
      <Toaster position="top-right" />
      <div className="topics-sidebar">
        <div className="topics-header">
          <h2>Топики</h2>
          <button onClick={() => setShowCreateModal(true)} className="create-topic-btn">+ Создать</button>
        </div>
        <TopicsList
          topics={topics}
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
          loading={loading}
        />
      </div>
      <div className="topics-details">
        {selectedTopic ? (
          <TopicDetails
            topicName={selectedTopic}
            cluster={currentCluster}
            onDelete={handleTopicDeleted}
          />
        ) : (
          <div className="placeholder">Выберите топик из списка</div>
        )}
      </div>
      {showCreateModal && (
        <CreateTopicModal
          cluster={currentCluster}
          onSuccess={handleTopicCreated}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}