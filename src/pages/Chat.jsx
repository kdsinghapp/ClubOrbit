import React from "react";

export default function Chat() {

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
              <li><a href="/">Home</a></li>
              <li>People</li>
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
                        <span>Activity</span>
                      </a>
                    </li>
                    <li>
                      <a href="/event">
                        <img alt="Icon" src="/assets/img/icons/booking-icon.svg" />
                        <span>Events</span>
                      </a>
                    </li>
                    <li>
                      <a href="/places">
                        <img alt="Icon" src="/assets/img/icons/dashboard-icon.svg" />
                        <span>Places</span>
                      </a>
                    </li>
                    <li>
                      <a className="active" href="/people">
                        <img alt="Icon" src="/assets/img/icons/profile-icon.svg" />
                        <span>People</span>
                      </a>
                    </li>
                    <li>
                      <a href="/user-profile">
                        <img alt="Icon" src="/assets/img/icons/chat-icon.svg" />
                        <span>Profile Setting</span>
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
            <div className="row">
              <div className="col-md-12">
                <div className="chat-window">

                  <div className="chat-cont-right">
                    <div className="chat-header">
                      <a className="back-user-list" href="javascript:void(0)" id="back_user_list">
                        <i className="feather-chevrons-left"></i>
                      </a>
                      <div className="media">
                        <div className="media-img-wrap">
                          <div className="avatar avatar-online">
                            <img alt="User" className="avatar-img rounded-circle" src="/assets/img/profiles/avatar-02.jpg" />
                          </div>
                        </div>
                        <div className="media-body">
                          <div className="user-name">User Name</div>
                        </div>
                      </div>
                      <div className="chat-options">
                        <div className="dropdown dropdown-action table-drop-action">
                          <a aria-expanded="false" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" href="#"><i className="fa fa-ellipsis-v"></i></a>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a className="dropdown-item" href="javascript:void(0);"><i className="feather feather-archive"></i>Achive</a>
                            <a className="dropdown-item" href="javascript:void(0);"><i className="feather feather-mic-off"></i>Muted</a>
                            <a className="dropdown-item" href="javascript:void(0);"><i className="feather feather-trash"></i>Delete</a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="chat-body">
                      <div className="chat-scroll">
                        <ul className="list-unstyled">
                          <li className="media sent read-chat">
                            <div className="media-body">
                              <div className="msg-box">
                                <div>
                                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing. </p>
                                  <ul className="chat-msg-info">
                                    <li>
                                      <div className="chat-time">
                                        <span>8:30 AM</span>
                                        <span className="msg-seen"><i className="fa fa-check"></i></span>
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="avatar">
                              <img alt="User" className="avatar-img rounded-circle" src="/assets/img/profiles/avatar-02.jpg" />
                            </div>
                          </li>
                          <li className="media received">
                            <div className="avatar">
                              <img alt="User" className="avatar-img rounded-circle" src="/assets/img/profiles/avatar-03.jpg" />
                            </div>
                            <div className="media-body">
                              <div className="msg-box">
                                <div>
                                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing. </p>
                                  <p>Ok?</p>
                                  <ul className="chat-msg-info">
                                    <li>
                                      <div className="chat-time">
                                        <span>8:30 AM</span>
                                        <span className="msg-seen"><i className="fa fa-check"></i></span>
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li className="chat-date">Today</li>
                          <li className="media received">
                            <div className="avatar">
                              <img alt="User" className="avatar-img rounded-circle" src="/assets/img/profiles/avatar-03.jpg" />
                            </div>
                            <div className="media-body">
                              <div className="msg-box">
                                <div>
                                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing. </p>
                                  <ul className="chat-msg-info">
                                    <li>
                                      <div className="chat-time">
                                        <span>8:30 AM</span>
                                        <span className="msg-seen"><i className="fa fa-check"></i></span>
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li className="media sent">
                            <div className="media-body">
                              <div className="msg-box">
                                <div>
                                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing. </p>
                                  <div className="chat-msg-actions dropdown">
                                    <a aria-expanded="false" aria-haspopup="true" data-toggle="dropdown" href="#">
                                      <i className="fe fe-elipsis-v"></i>
                                    </a>
                                    <div className="dropdown-menu dropdown-menu-right">
                                      <a className="dropdown-item" href="#">Delete</a>
                                    </div>
                                  </div>
                                  <ul className="chat-msg-info">
                                    <li>
                                      <div className="chat-time">
                                        <span>8:30 AM</span>
                                        <span className="msg-seen"><i className="fa fa-check"></i></span>
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="avatar">
                              <img alt="User" className="avatar-img rounded-circle" src="/assets/img/profiles/avatar-02.jpg" />
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="chat-footer">
                      <div className="form-custom">
                        <div className="input-group-prepend">
                          <i className="feather-paperclip"></i>
                        </div>
                        <div className="send-blk">
                          <input className="input-msg-send form-control" placeholder="Type something" type="text" />
                          <div className="input-group-append">
                            <button className="btn msg-send-btn" type="button"><i className="feather-send"></i></button>
                          </div>
                        </div>
                      </div>
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
