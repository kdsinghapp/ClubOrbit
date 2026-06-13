import React from "react";
import { Link } from "react-router-dom";

export default function Home() {

  return (
    <>
      <div id="global-loader">
        <div className="loader-img">
          <img alt="Global" className="img-fluid" src="/assets/img/logo.png" style={{ width: "120px" }} />
        </div>
      </div>
      <div className="main-wrapper">
        <section className="hero">
          <div className="bg-overlay">
            <div className="container">
              <div className="row align-items-center min-vh-100">
                <div className="col-lg-8 hero-left">
                  <img className="mb-4 pt-5" src="/assets/img/logo.png" style={{ width: "180px" }} />
                  <h1>
                    Your gateway to events, members,<br />
                    and real-time discovery.
                  </h1>
                  <p>
                    Club Orbit is a sleek mobile experience for venues and members.
                    Discover places, connect with people, and stay in sync with what's happening —
                    from your neighborhood to anywhere in the world.
                  </p>
                  <div className="d-flex gap-3 mt-4 align-items-center mb-4">
                    <a className="btn-orbit-primary">Get early access</a>
                    <a className="btn-orbit-outline">Contact support</a>
                  </div>
                  <div className="hero-pills mt-4 d-flex flex-wrap">
                    <span>Live social maps</span>
                    <span>Events &amp; discovery</span>
                    <span>Messaging &amp; groups</span>
                    <span>Venue tools</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="why-section py-5">
          <div className="container">
            <small className="why-label">WHY CLUB ORBIT</small>
            <h2 className="why-title">Search anywhere. Connect everywhere.</h2>
            <div className="row g-4 mt-4">
              <div className="col-lg-6">
                <div className="glass-card h-100">
                  <p className="why-text">
                    Club Orbit keeps you connected, informed, and in control.
                    Whether you're managing a venue or attending one, you get a
                    single place for events, community, and updates — built to feel
                    fast, clean, and modern.
                  </p>
                  <div className="row g-3 mt-4">
                    <div className="col-md-6">
                      <div className="mini-card">
                        <div className="icon-circle">
                          🌐
                        </div>
                        <div>
                          <h6>Global discovery</h6>
                          <p>
                            Start a network from any location and find what matches your vibe.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mini-card">
                        <div className="icon-circle lightning">
                          ⚡
                        </div>
                        <div>
                          <h6>Real-time updates</h6>
                          <p>
                            Stay synced with the people and places you care about, instantly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="glass-card h-100">
                  <h5 className="mb-3">Quick Actions</h5>
                  <div className="row g-3 mt-2">
                    <div className="col-md-6">
                      <div className="mini-card">
                        <div className="icon-circle">
                          🏛️
                        </div>
                        <div>
                          <h6>Add Club</h6>
                          <p>
                            Create and manage your own club community.
                          </p>
                          <Link to="/clubs/create" className="btn btn-sm btn-primary mt-2">Create Club</Link>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mini-card">
                        <div className="icon-circle">
                          📅
                        </div>
                        <div>
                          <h6>Add Activity</h6>
                          <p>
                            Share activities and events with your community.
                          </p>
                          <Link to="/add-activity" className="btn btn-sm btn-primary mt-2">Add Activity</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="preview">
          <div className="container">
            <small className="label">PREVIEW</small>
            <h2>A clean experience, built for speed</h2>
            <div className="row g-4 mt-4">
              <div className="col-md-3"><div className="phone">
                <h6 className="muted text-center">Activity Feed</h6>
                <img src="/assets/img/home_preview.png" /></div></div>
              <div className="col-md-3"><div className="phone">
                <h6 className="muted text-center">Event Calendar</h6>
                <img src="/assets/img/event_preview.png" /></div></div>
              <div className="col-md-3"><div className="phone">
                <h6 className="muted text-center">Chat With Friends</h6><img src="/assets/img/chat_preview.png" /></div></div>
              <div className="col-md-3"><div className="phone">
                <h6 className="muted text-center">Club Details</h6>
                <img src="/assets/img/club_preview.png" /></div></div>
            </div>
          </div>
        </section>
        <section className="cta-wrap">
          <div className="container">
            <div className="cta-card">
              <div className="row align-items-center">
                <div className="col-lg-7">
                  <small className="cta-label">EARLY ACCESS</small>
                  <h3>Be among the first to try Club Orbit</h3>
                  <p>
                    Sign up as a tester and we’ll invite you as soon as
                    your platform is available.
                  </p>
                </div>
                <div className="col-lg-5 text-lg-end mt-3 mt-lg-0">
                  <div className="d-inline-flex gap-3">
                    <a className="btn-orbit-primary">Join the beta</a>
                    <a className="btn-orbit-outline">Email us</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
