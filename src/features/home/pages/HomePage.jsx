import '../home.css';

const HomePage = () => {
  return (
    <>
      <div className="home-container">
        <div className="home-header">
          <h2>Home</h2>
          <p>Welcome to Library Clearance Monitoring System</p>
        </div>

        <div className="home-metrics-grid">
          <div className="home-metric-card">
            <h3>Pending Clearances</h3>
            <p className="metric-value">--</p>
            <p className="metric-caption">Displays the number of pending clearances.</p>
          </div>
          <div className="home-metric-card">
            <h3>Unfinished Clearances</h3>
            <p className="metric-value">--</p>
            <p className="metric-caption">Tracks students currently awaiting library clearance.</p>
          </div>
          <div className="home-metric-card">
            <h3>Cleared Clearances</h3>
            <p className="metric-value">--</p>
            <p className="metric-caption">Shows how many clearances have been completed.</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <div className="recent-activity-header">
          <h2>Recent Activity</h2>
          <p>Latest Clearance Requests and Updates</p>
        </div>

        <div className="recent-activity-list">
          <div className="activity-item">
            <div className="activity-main">
              <div className="activity-title-row">
                <span className="activity-name">John Doe</span>
                <span className="activity-dot">•</span>
                <span className="activity-status-text">verified clearance</span>
              </div>
              <div className="activity-secondary">
                <span className="activity-student">Maria Cruz #2021135777</span>
              </div>
              <div className="activity-meta">
                <span className="activity-timestamp">2026-01-22 09:15</span>
                <span className="activity-dot">•</span>
                <span className="activity-relative">2 mins ago</span>
              </div>
            </div>
            <span className="activity-badge">Cleared</span>
          </div>

          <div className="activity-item">
            <div className="activity-main">
              <div className="activity-title-row">
                <span className="activity-name">John Doe</span>
                <span className="activity-dot">•</span>
                <span className="activity-status-text">verified clearance</span>
              </div>
              <div className="activity-secondary">
                <span className="activity-student">Maria Cruz #2021135777</span>
              </div>
              <div className="activity-meta">
                <span className="activity-timestamp">2026-01-22 09:15</span>
                <span className="activity-dot">•</span>
                <span className="activity-relative">2 mins ago</span>
              </div>
            </div>
            <span className="activity-badge">Cleared</span>
          </div>

          <div className="activity-item">
            <div className="activity-main">
              <div className="activity-title-row">
                <span className="activity-name">John Doe</span>
                <span className="activity-dot">•</span>
                <span className="activity-status-text">verified clearance</span>
              </div>
              <div className="activity-secondary">
                <span className="activity-student">Maria Cruz #2021135777</span>
              </div>
              <div className="activity-meta">
                <span className="activity-timestamp">2026-01-22 09:15</span>
                <span className="activity-dot">•</span>
                <span className="activity-relative">2 mins ago</span>
              </div>
            </div>
            <span className="activity-badge">Cleared</span>
          </div>

          <div className="activity-item">
            <div className="activity-main">
              <div className="activity-title-row">
                <span className="activity-name">John Doe</span>
                <span className="activity-dot">•</span>
                <span className="activity-status-text">verified clearance</span>
              </div>
              <div className="activity-secondary">
                <span className="activity-student">Maria Cruz #2021135777</span>
              </div>
              <div className="activity-meta">
                <span className="activity-timestamp">2026-01-22 09:15</span>
                <span className="activity-dot">•</span>
                <span className="activity-relative">2 mins ago</span>
              </div>
            </div>
            <span className="activity-badge">Cleared</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
