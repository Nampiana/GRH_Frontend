export const ApiUrl =  `${process.env.REACT_APP_HOST_API}`;

export const header = (type = "json") => {
  const token = localStorage.getItem("access_token");

  const headers = {
    json: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // Ajoute le token si dispo
    },
    image: {
      "Content-Type": "multipart/form-data",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  return {
    headers: headers[type] || headers.json,
  };
};

