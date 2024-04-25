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
  // Get the values from the form
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
      if (data.id) {
        // Add to the main cities table
        const mainTableBody = document
          .getElementById("citiesTable")
          .getElementsByTagName("tbody")[0];
        const newRow = mainTableBody.insertRow();
        newRow.innerHTML = `
          <td>${data.id}</td>
          <td>${data.city}</td>
          <td>${data.country}</td>
          <td>${parseInt(data.population).toLocaleString()}</td>
        `;
        // Also, show it in the add result table
        const addResultBody = document
          .getElementById("addResultTable")
          .getElementsByTagName("tbody")[0];
        const newRowInAddResult = addResultBody.insertRow();
        newRowInAddResult.innerHTML = `
          <td>${data.id}</td>
          <td>${data.city}</td>
          <td>${data.country}</td>
          <td>${parseInt(data.population).toLocaleString()}</td>
        `;
        document.getElementById("addResultContainer").style.display = "block";
      } else {
        console.error("City not added: ", data.error);
      }
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
          let rows = document.getElementById("citiesTable").rows;
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].cells[0].textContent == data.id) {
              rows[i].cells[1].textContent = data.city;
              rows[i].cells[2].textContent = data.country;
              rows[i].cells[3].textContent = parseInt(
                data.population
              ).toLocaleString();
              break;
            }
          }
        } else {
          console.error("City not updated: ", data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
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
          if (data.id) {
            let rows = document.getElementById("citiesTable").rows;
            for (let i = 0; i < rows.length; i++) {
              if (rows[i].cells[0].textContent == data.id) {
                document.getElementById("citiesTable").deleteRow(i);
                break;
              }
            }
          } else {
            console.error("Error: ", data.error);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  });

searchFunctionButton.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent the default form submission if it's within a form
  const searchValue = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  if (searchValue !== "") {
    performSearch(searchValue);
  }
});

function performSearch(query) {
  fetch(`${baseUrl}/read_city?query=${query}`)
    .then((response) => response.json())
    .then((data) => {
      updateResults(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function updateResults(data) {
  const resultBody = resultContainer.getElementsByTagName("tbody")[0];
  resultBody.innerHTML = ""; // Clear previous results

  if (data.length === 0) {
    resultBody.innerHTML = "<tr><td colspan='4'>No results found.</td></tr>";
  } else {
    data.forEach((item, index) => {
      let newRow = resultBody.insertRow();
      newRow.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.country}</td>
        <td>${item.population.toLocaleString()}</td>
      `;
    });
  }
  resultContainer.style.display = "block";
}
