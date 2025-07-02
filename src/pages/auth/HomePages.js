import React from "react";
import Sidebar from "../../templates/sidebar";
import Topbar from "../../templates/topbar";
import Preloader from "../../templates/preloader";

function HomePage() {
  return (
    <>
      <Preloader />
      <div id="pcoded" className="pcoded">
        <div className="pcoded-overlay-box"></div>
        <div className="pcoded-container navbar-wrapper">
          <Topbar />
          <div className="pcoded-main-container">
            <div className="pcoded-wrapper">
              <Sidebar />
              <div className="pcoded-content">
                <div className="pcoded-inner-content">
                  <div className="main-body">
                    <div className="page-wrapper">
                      <div className="page-body">
                        <div className="row">
                          <div className="col-md-6 col-xl-3">
                            <div className="card widget-card-1">
                              <div className="card-block-small">
                                <i className="icofont icofont-pie-chart bg-c-blue card1-icon"></i>
                                <span className="text-c-blue f-w-600">Use space</span>
                                <h4>49/50GB</h4>
                                <div>
                                  <span className="f-left m-t-10 text-muted">
                                    <i className="text-c-blue f-16 icofont icofont-warning m-r-10"></i>
                                    Get more space
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6 col-xl-3">
                            <div className="card widget-card-1">
                              <div className="card-block-small">
                                <i className="icofont icofont-ui-home bg-c-pink card1-icon"></i>
                                <span className="text-c-pink f-w-600">Revenue</span>
                                <h4>$23,589</h4>
                                <div>
                                  <span className="f-left m-t-10 text-muted">
                                    <i className="text-c-pink f-16 icofont icofont-calendar m-r-10"></i>
                                    Last 24 hours
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6 col-xl-3">
                            <div className="card widget-card-1">
                              <div className="card-block-small">
                                <i className="icofont icofont-warning-alt bg-c-green card1-icon"></i>
                                <span className="text-c-green f-w-600">Fixed issue</span>
                                <h4>45</h4>
                                <div>
                                  <span className="f-left m-t-10 text-muted">
                                    <i className="text-c-green f-16 icofont icofont-tag m-r-10"></i>
                                    Tracked via microsoft
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6 col-xl-3">
                            <div className="card widget-card-1">
                              <div className="card-block-small">
                                <i className="icofont icofont-social-twitter bg-c-yellow card1-icon"></i>
                                <span className="text-c-yellow f-w-600">Followers</span>
                                <h4>+562</h4>
                                <div>
                                  <span className="f-left m-t-10 text-muted">
                                    <i className="text-c-yellow f-16 icofont icofont-refresh m-r-10"></i>
                                    Just update
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="styleSelector"></div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}

export default HomePage;
