import React from "react";

export default function UserSetting() {
  return (
    <>
      <div id="global-loader">
        <div className="loader-img">
          <img alt="Global" className="img-fluid" src="/assets/img/logo.png" style={{ width: "120px" }} />
        </div>
      </div>
      <div className="main-wrapper">
        <section className="breadcrumb breadcrumb-list mb-0">
          <span className="primary-right-round"></span>
          <div className="container">
            <ul>
              <li>
                <a href="/">
                  Home
                </a>
              </li>
              <li>
                Change Password
              </li>
            </ul>
          </div>
        </section>
        <div className="dashboard-section">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="dashboard-menu">
                  <ul>
                    <li>
                      <a href="/activity">
                        <img alt="Icon" src="/assets/img/icons/invoice-icon.svg" />
                        <span>
                          Activity
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="/event">
                        <img alt="Icon" src="/assets/img/icons/booking-icon.svg" />
                        <span>
                          Events
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="/places">
                        <img alt="Icon" src="/assets/img/icons/dashboard-icon.svg" />
                        <span>
                          Places
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="/people">
                        <img alt="Icon" src="/assets/img/icons/profile-icon.svg" />
                        <span>
                          People
                        </span>
                      </a>
                    </li>
                    <li>
                      <a className="active" href="/user-profile">
                        <img alt="Icon" src="/assets/img/icons/chat-icon.svg" />
                        <span>
                          Profile Setting
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="container">
            <div className="coach-court-list profile-court-list">
              <ul className="nav">
                <li>
                  <a href="/user-profile">
                    Profile
                  </a>
                </li>
                <li>
                  <a className="active" href="/user-setting-password">
                    Change Password
                  </a>
                </li>
              </ul>
            </div>
            <div className="row">
              <div className="col-sm-12">
                <div className="profile-detail-group">
                  <div className="card">
                    <form>
                      <div className="row">
                        <div className="col-lg-7 col-md-7">
                          <div className="input-space">
                            <label className="form-label">
                              Old Password
                            </label>
                            <input className="form-control" id="password" placeholder="Enter Old Password" type="text" />
                          </div>
                        </div>
                        <div className="col-lg-7 col-md-7">
                          <div className="input-space">
                            <label className="form-label">
                              New Password
                            </label>
                            <input className="form-control" id="new-password" placeholder="Enter New Password" type="text" />
                          </div>
                        </div>
                        <div className="col-lg-7 col-md-7">
                          <div className="input-space mb-0">
                            <label className="form-label">
                              Confirm Password
                            </label>
                            <input className="form-control" id="confirm-password" placeholder="Enter Confirm Password" type="text" />
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="save-changes text-end">
                    <a className="btn btn-primary reset-profile" href="javascript:;">
                      Reset
                    </a>
                    <a className="btn btn-secondary save-profile" href="javascript:;">
                      Save Change
                    </a>
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
