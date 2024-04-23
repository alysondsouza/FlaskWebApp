const app_port = 5000;
const baseUrl = `http://127.0.0.1:${app_port}`;

const homeButton = document.getElementById("homeButton");
const readButton = document.getElementById("readButton");
const searchFunctionButton = document.getElementById("searchFunctionButton");
const createButton = document.getElementById("createButton");
const updateButton = document.getElementById("updateButton");
const deleteButton = document.getElementById("deleteButton");
const tableContainer = document.querySelector(".container");
const searchContainer = document.querySelector(".search-container");
const updateContainer = document.querySelector(".update-container");
const deleteContainer = document.querySelector(".delete-container");
const resultContainer = document.getElementById("resultContainer");
const addContainer = document.querySelector(".form-container");

function hideAllContainers() {
  tableContainer.style.display = "none";
  searchContainer.style.display = "none";
  resultContainer.style.display = "none";
  addContainer.style.display = "none";
  updateContainer.style.display = "none";
  deleteContainer.style.display = "none";
}

homeButton.addEventListener("click", () => {
  hideAllContainers();
  tableContainer.style.display = "block";
});

readButton.addEventListener("click", () => {
  hideAllContainers();
  searchContainer.style.display = "block";
});

searchFunctionButton.addEventListener("click", () => {
  const searchValue = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  if (searchValue !== "") {
    document.getElementById("resultContainer").style.display = "block";
  }
  resultContainer.style.display = "block";
});

createButton.addEventListener("click", () => {
  hideAllContainers();
  addContainer.style.display = "block";
});

updateButton.addEventListener("click", () => {
  hideAllContainers();
  updateContainer.style.display = "block";
});

deleteButton.addEventListener("click", () => {
  hideAllContainers();
  deleteContainer.style.display = "block";
});

window.onload = () => {
  hideAllContainers();
  tableContainer.style.display = "block";
  homeButton.focus();
};

fetch(`${baseUrl}/cities.json`)
  .then((response) => response.json())
  .then((data) => {
    const tableBody = document
      .getElementById("citiesTable")
      .getElementsByTagName("tbody")[0];
    data.forEach((item, index) => {
      let newRow = tableBody.insertRow();
      newRow.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.city}</td>
            <td>${item.country}</td>
            <td>${item.population.toLocaleString()}</td>
        `;
    });
  })
  .catch((error) => console.error("Error:", error));

document.getElementById("addCityForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const city = document.getElementById("cityName").value;
  const country = document.getElementById("countryName").value;
  const population = document.getElementById("populationCount").value;

  fetch(`${baseUrl}/create_city`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ city, country, population }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

document
  .getElementById("updateCityForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const id = document.getElementById("updateCityId").value;
    const city = document.getElementById("updateCityName").value;
    const country = document.getElementById("updateCountryName").value;
    const population = document.getElementById("updatePopulationCount").value;

    fetch(`${baseUrl}/update_city`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, city, country, population }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          document.getElementById(
            "updateMessage"
          ).textContent = `Success: Updated City - ID: ${data.id}, Name: ${data.city}, Country: ${data.country}, Population: ${data.population}`;
          document.getElementById("updateResultContainer").style.display =
            "block";
        } else {
          document.getElementById("updateMessage").textContent =
            "Error: City not updated";
          document.getElementById("updateResultContainer").style.display =
            "block";
        }
      })
      .catch((error) => {
        document.getElementById(
          "updateMessage"
        ).textContent = `Error: ${error}`;
        document.getElementById("updateResultContainer").style.display =
          "block";
      });
  });

document
  .getElementById("deleteFunctionButton")
  .addEventListener("click", function () {
    const cityId = document.getElementById("deleteInput").value.trim();
    if (cityId !== "") {
      fetch(`${baseUrl}/delete_city?id=${cityId}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById("deleteMessage").textContent =
            "Success: City deleted successfully.";
          document.getElementById("deleteResultContainer").style.display =
            "block";
        })
        .catch((error) => {
          document.getElementById("deleteMessage").textContent =
            "Error: " + error;
          document.getElementById("deleteResultContainer").style.display =
            "block";
        });
    }
  });
