import React from "react";

export default function ViewClub() {
  return (
    <>
      <div id="global-loader">
        <div className="loader-img">
          <img alt="Global" className="img-fluid" src="/assets/img/logo.png" style={{ width: "120px" }}/>
        </div>
      </div>
      <div className="main-wrapper">
        <div className="content">
          <div className="club-header">
            <div className="container mt-4">
              <div className="d-flex justify-content-between mb-3">
                <h3 className="fw-bold">
                  View Club
                </h3>
                <div>
                  <a className="btn btn-sm btn-primary" href="/activity">
                    <i className="bi bi-arrow-left"></i>
                    Back To Activity
                  </a>
                </div>
              </div>
              <div className="banner-box">
                <div className="club-logo">
                  Logo
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row">
              <div className="col-lg-8">
                <h2 className="club-name">
                  Yhhy Group Pte. Ltd.
                </h2>
                <div className="stats-card mt-4">
                  <div className="row">
                    <div className="col stat-box">
                      <h4>
                        1
                      </h4>
                      <small>
                        Members
                      </small>
                    </div>
                    <div className="col stat-box">
                      <h4>
                        0
                      </h4>
                      <small>
                        Past Events
                      </small>
                    </div>
                    <div className="col stat-box">
                      <h4>
                        0
                      </h4>
                      <small>
                        Upcoming
                      </small>
                    </div>
                  </div>
                </div>
                <div className="row text-center mt-4 g-3">
                  <div className="col">
                    <div className="action-btn">
                      <i className="bi bi-person-plus"></i>
                    </div>
                    <small>
                      Add Group
                    </small>
                  </div>
                  <div className="col">
                    <div className="action-btn">
                      <i className="bi bi-chat-dots"></i>
                    </div>
                    <small>
                      Chat
                    </small>
                  </div>
                  <div className="col">
                    <div className="action-btn">
                      <i className="bi bi-share"></i>
                    </div>
                    <small>
                      Share
                    </small>
                  </div>
                  <div className="col">
                    <div className="action-btn">
                      <i className="bi bi-file-earmark-pdf"></i>
                    </div>
                    <small>
                      PDF
                    </small>
                  </div>
                </div>
                <div className="section-card mt-4">
                  <h5 className="fw-bold mb-3">
                    About
                  </h5>
                  <p className="text-muted">
                    Yhhy Group Pte. Ltd. stands at the intersection of innovation and responsibility, delivering integrated lifestyle, hospitality, and property solutions across Asia...
                  </p>
                  <button className="btn btn-outline-secondary rounded-pill btn-sm">
                    More
                  </button>
                </div>
                <div className="section-card d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-people fs-4 text-warning"></i>
                    <span className="fw-semibold">
                      Members
                    </span>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="section-card map-box mt-3">
                  <h4 className="mb-3">
                    Location Map
                  </h4>
                  <iframe src="https://maps.google.com/maps?q=Singapore&t=&z=12&ie=UTF8&iwloc=&output=embed"></iframe>
                  <p className="mt-3 mb-0">
                    <i className="bi bi-geo-alt text-warning"></i>
                    8 Kaki Bukit Rd 2, #02 16, Singapore 417841
                  </p>
                </div>
                <div className="section-card">
                  <h4 className="mb-3">
                    Activities
                  </h4>
                  <div className="d-flex flex-wrap gap-2">
                    <div className="tag">
                      summer camps
                    </div>
                    <div className="tag">
                      fitness
                    </div>
                    <div className="tag">
                      hiking
                    </div>
                    <div className="tag">
                      art classes
                    </div>
                    <div className="tag">
                      tennis
                    </div>
                    <div className="tag">
                      cooking classes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
