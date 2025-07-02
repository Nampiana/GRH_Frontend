import React, { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

function Login() {
   const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const { login, isLoading, alertMessage } = useContext(AuthContext);

  const handleSubmit = (e) => {
    console.log("makato");
    
    e.preventDefault();
    setErrorMessage(""); // Réinitialiser le message d'erreur avant la tentative de connexion

    login({ email, password }).catch((err) => {
      setErrorMessage(err.response?.data?.message || "Email ou mot de passe incorrect !");
    });
  };
  return (
    <>
      

    <section className="login p-fixed d-flex text-center bg-primary common-img-bg">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <div className="login-card card-block auth-body mr-auto ml-auto">
              <form className="md-float-material" onSubmit={handleSubmit}>
                <div className="text-center">
                  <img src="assets/images/auth/logo-dark.png" alt="logo.png" />
                </div>
                <div className="auth-box">
                  <div className="row m-b-20">
                    <div className="col-md-12">
                      <h3 className="text-left txt-primary">Sign In</h3>
                    </div>
                  </div>
                  <hr />
                  <div className="input-group">
                    <input type="email" className="form-control" placeholder="Your Email Address"  value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <span className="md-line"></span>
                  </div>
                  <div className="input-group">
                    <input type="password" className="form-control" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <span className="md-line"></span>
                  </div>

                  {(errorMessage || alertMessage) && (
                    <div className="row">
                      <div className="col-md-12">
                        <div className={`alert alert-${errorMessage ? 'danger' : alertMessage?.type}`} role="alert">
                          {errorMessage || alertMessage?.text}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="row m-t-25 text-left">
                    <div className="col-sm-7 col-xs-12">
                      <div className="checkbox-fade fade-in-primary">
                        <label>
                          <input type="checkbox" value="" />
                          <span className="cr">
                            <i className="cr-icon icofont icofont-ui-check txt-primary"></i>
                          </span>
                          <span className="text-inverse">Remember me</span>
                        </label>
                      </div>
                    </div>
                    <div className="col-sm-5 col-xs-12 forgot-phone text-right">
                      <a href="auth-reset-password.html" className="text-right f-w-600 text-inverse">
                        Forgot Your Password?
                      </a>
                    </div>
                  </div>
                  <div className="row m-t-30">
                    <div className="col-md-12">
                      <button type="submit" className="btn btn-primary btn-md btn-block waves-effect text-center m-b-20">
                        {isLoading ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          "Sign in"
                        )}
                      </button>
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-md-10">
                      <p className="text-inverse text-left m-b-0">Thank you and enjoy our website.</p>
                      <p className="text-inverse text-left"><b>Your Authentication Team</b></p>
                    </div>
                    <div className="col-md-2">
                      <img src="assets/images/auth/Logo-small-bottom.png" alt="small-logo.png" />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}

export default Login;
