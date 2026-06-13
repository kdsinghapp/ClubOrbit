import { Link } from "react-router-dom";

export default function Footer() {

  return (
    <>
       <footer className="footer">
          <div className="container">
            <div className="footer-top">
              <div className="row">
                <div className="col-lg-3 col-md-6">
                  <div className="footer-widget footer-menu">
                    <h4 className="footer-title">About</h4>
                    <p>Club Orbit keeps you connected, informed, and in control. Whether you're managing a venue or attending one, you get a single place for events, community, and updates — built to feel fast, clean and modern.</p>
                  </div>
                </div>
                <div className="col-lg-2 col-md-6">
                  <div className="footer-widget footer-menu">
                    <h4 className="footer-title">Quick Links</h4>
                    <ul>
                      <li><Link to="/about">About us</Link></li>
                      <li><Link to="/clubs">Clubs</Link></li>
                      <li><Link to="/events">Events</Link></li>
                      <li><Link to="/blogs">Blogs</Link></li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-2 col-md-6">
                  <div className="footer-widget footer-menu">
                    <h4 className="footer-title">Support</h4>
                    <ul>
                      <li><Link to="/contact-us">Contact Us</Link></li>
                      <li><Link to="/faq">Faq</Link></li>
                      <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                      <li><Link to="/terms-condition">Terms &amp; Conditions</Link></li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="footer-widget footer-menu">
                    <h4 className="footer-title">Contact us</h4>
                    <div className="footer-address-blk">
                      <div className="footer-call"><span>Toll free Customer Care</span><p>+XX XXXXX XXXXX</p></div>
                      <div className="footer-call"><span>Need Live Support</span><p><Link to="#">test@mail.com</Link></p></div>
                    </div>
                    <div className="social-icon">
                      <ul>
                        <li><Link className="facebook" to="#"><i className="fa fa-facebook-f"></i></Link></li>
                        <li><Link className="twitter" to="#"><i className="fa fa-twitter"></i></Link></li>
                        <li><Link className="instagram" to="#"><i className="fa fa-instagram"></i></Link></li>
                        <li><Link className="linked-in" to="#"><i className="fa fa-linkedin-in"></i></Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-lg-2 col-md-6">
                  <div className="footer-widget footer-menu">
                    <h4 className="footer-title">Download</h4>
                    <ul>
                      <li><Link to="#"><img alt="Apple" src="/assets/img/icons/icon-apple.svg" /></Link></li>
                      <li><Link to="#"><img alt="Google" src="/assets/img/icons/google-icon.svg" /></Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="container">
              <div className="copyright">
                <div className="row align-items-center">
                  <div className="col-md-12">
                    <div className="copyright-text text-center">
                      <p className="mb-0">© 2026 Cluborbit — All rights reserved.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
    </>
  );
}