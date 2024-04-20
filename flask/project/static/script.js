const app_port = 5000;
const baseUrl = `http://127.0.0.1:${app_port}`;

const homeButton = document.getElementById("homeButton");
const searchButton = document.getElementById("searchButton");
const searchFunctionButton = document.getElementById("searchFunctionButton");
const addButton = document.getElementById("addButton");
const changeButton = document.getElementById("changeButton");
const tableContainer = document.querySelector(".container");
const searchContainer = document.querySelector(".search-container");
const resultContainer = document.getElementById("resultContainer");
const addContainer = document.querySelector(".form-container");

function hideAllContainers() {
  tableContainer.style.display = "none";
  searchContainer.style.display = "none";
  resultContainer.style.display = "none";
  addContainer.style.display = "none";
}

homeButton.addEventListener("click", () => {
  hideAllContainers();
  tableContainer.style.display = "block";
});

searchButton.addEventListener("click", () => {
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

addButton.addEventListener("click", () => {
  hideAllContainers();
  addContainer.style.display = "block";
});

changeButton.addEventListener("click", () => {
  hideAllContainers();
  // Add functionality here
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

  fetch(`${baseUrl}/add_city`, {
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
  .getElementById("searchFunctionButton")
  .addEventListener("click", function () {
    const searchValue = document
      .getElementById("searchInput")
      .value.trim()
      .toLowerCase();
    const resultTableBody = document
      .getElementById("resultTable")
      .getElementsByTagName("tbody")[0];

    fetch(`${baseUrl}/cities.json`)
      .then((response) => response.json())
      .then((data) => {
        resultTableBody.innerHTML = "";
        const filteredData = data.filter((city) =>
          city.name.toLowerCase().includes(searchValue)
        );

        if (filteredData.length > 0) {
          filteredData.forEach((item, index) => {
            let newRow = resultTableBody.insertRow();
            newRow.innerHTML = `
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td>${item.country}</td>
          <td>${item.population.toLocaleString()}</td>
        `;
          });
          document.getElementById("resultContainer").style.display = "block";
        } else {
          resultTableBody.innerHTML =
            '<tr><td colspan="4">No match found</td></tr>';
          document.getElementById("resultContainer").style.display = "block";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        resultTableBody.innerHTML =
          '<tr><td colspan="4">Error fetching data</td></tr>';
        document.getElementById("resultContainer").style.display = "block";
      });
  });
