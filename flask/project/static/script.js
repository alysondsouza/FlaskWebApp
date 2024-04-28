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
const addResultContainer = document.getElementById("addResultContainer");
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
    resultContainer.style.display = "block";
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
    // Sort data by ID
    data.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    const tableBody = document
      .getElementById("citiesTable")
      .getElementsByTagName("tbody")[0];
    data.forEach((item) => {
      let newRow = tableBody.insertRow();
      newRow.innerHTML = `
        <td>${item.id}</td>
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
        const addResultBody = document
          .getElementById("addResultTable")
          .getElementsByTagName("tbody")[0];
        addResultBody.innerHTML = "";
        const newRowInAddResult = addResultBody.insertRow();
        newRowInAddResult.innerHTML = `
          <td>${data.id}</td>
          <td>${data.city}</td>
          <td>${data.country}</td>
          <td>${parseInt(data.population).toLocaleString()}</td>
        `;
        resultContainer.style.display = "block";
      } else {
        console.error("City not added: ", data.error);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  this.reset();
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
        if (data.updated && data.original) {
          updateTableRow(data.updated);
          // Update the resultContainer to show both the original and updated city information
          updateResults([data.original], [data.updated]);
          resultContainer.style.display = "block";
        } else {
          console.error("City not updated: ", data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    this.reset();
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
            deleteTableRow(cityId);
            // Use updateResults to show the deleted city information
            updateResults([data], []); // passing empty array for updatedData
            resultContainer.style.display = "block";
          } else {
            console.error("Error: ", data.error);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
    this.reset();
  });

searchFunctionButton.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent the default form submission if it's within a form
  const searchValue = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  resultContainer.style.display = "block";

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

function updateResults(originalData, updatedData) {
  const resultBody = document
    .getElementById("resultTable")
    .querySelector("tbody");
  resultBody.innerHTML = ""; // Clear previous results

  // Add data to the results table
  originalData.forEach((item) => {
    let row = resultBody.insertRow();
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.city}</td>
      <td>${item.country}</td>
      <td>${parseInt(item.population).toLocaleString()}</td>
    `;
  });

  // Highlight updated data in green
  if (updatedData && updatedData.length > 0) {
    updatedData.forEach((item) => {
      let updatedRow = resultBody.insertRow();
      updatedRow.classList.add("table-success"); // This adds the green background
      updatedRow.innerHTML = `
        <td>${item.id}</td>
        <td>${item.city}</td>
        <td>${item.country}</td>
        <td>${parseInt(item.population).toLocaleString()}</td>
      `;
    });
  }
}

function updateTableRow(data) {
  let tableBody = document.getElementById("citiesTable").querySelector("tbody");
  let row = [...tableBody.rows].find(
    (row) => row.cells[0].textContent == data.id
  );
  if (row) {
    row.cells[1].textContent = data.city;
    row.cells[2].textContent = data.country;
    row.cells[3].textContent = parseInt(data.population).toLocaleString();
  }
}

function deleteTableRow(cityId) {
  let tableBody = document.getElementById("citiesTable").querySelector("tbody");
  let row = [...tableBody.rows].find(
    (row) => row.cells[0].textContent == cityId
  );
  if (row) {
    tableBody.removeChild(row);
  }
}
