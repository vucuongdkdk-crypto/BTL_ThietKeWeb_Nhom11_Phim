var currentMovieId = 1;
var selectedSeats = "";
var selectedTotal = 0;

var movieImages = {
  1: "xucat.png",
  2: "muahenamay.png",
  3: "benkianganha.png",
  4: "khurungbiethat.png"
};

function get(id) { return document.getElementById(id); }

function money(n) {
  return Number(n).toLocaleString("vi-VN") + get("currency-unit").textContent;
}

function findMovie(id) {
  var cards = document.getElementsByClassName("movie-card");
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    if (c.getAttribute("data-movie-id") == id) {
      return {
        id: +c.getAttribute("data-movie-id"),
        name: c.getElementsByClassName("movie-name")[0].textContent,
        category: c.getElementsByClassName("movie-category")[0].textContent,
        description: c.getAttribute("data-description"),
        price: +c.getAttribute("data-price")
      };
    }
  }
  return null;
}

function showPage(name) {
  var pages = document.getElementsByClassName("page");
  for (var i = 0; i < pages.length; i++) pages[i].style.display = "none";
  get(name + "-page").style.display = "block";
  window.scrollTo(0, 0);
}

function showHome() { showPage("home"); }

function showMovies() {
  showPage("home");
  get("movies").scrollIntoView();
}

function showDetail(id) {
  var movie = findMovie(id);
  var detail = document.importNode(get("movie-detail-template").content, true).firstElementChild;
  var image = detail.getElementsByClassName("movie-image")[0];

  currentMovieId = id;
  image.style.backgroundImage = "url('" + movieImages[movie.id] + "')";
  detail.getElementsByClassName("detail-category")[0].textContent = movie.category;
  detail.getElementsByClassName("detail-name")[0].textContent = movie.name;
  detail.getElementsByClassName("detail-description")[0].textContent = movie.description;
  detail.getElementsByClassName("detail-price")[0].textContent = money(movie.price);
  detail.getElementsByClassName("detail-booking-button")[0].onclick = function () {
    showBooking(movie.id);
  };

  get("movie-detail").replaceChildren(detail);
  showPage("detail");
}

function showBooking(id) {
  if (id != null) currentMovieId = id;

  var boxes = document.getElementsByName("seat");
  for (var i = 0; i < boxes.length; i++) boxes[i].checked = false;

  get("movie-name").textContent = findMovie(currentMovieId).name;
  showPage("booking");
  countPrice();
}

function countPrice() {
  var boxes = document.getElementsByName("seat");
  var movie = findMovie(currentMovieId);
  selectedSeats = "";
  selectedTotal = 0;

  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) {
      selectedSeats += boxes[i].value + " ";
      selectedTotal += movie.price;
    }
  }

  var seatsEl = get("selected-seats");
  seatsEl.textContent = selectedSeats || seatsEl.getAttribute("data-empty-text");
  get("total-price").textContent = money(selectedTotal);
}

function showPayment() {
  if (!selectedSeats) return alert(get("booking-page").getAttribute("data-seat-error"));

  get("payment-movie").textContent = findMovie(currentMovieId).name;
  get("payment-seats").textContent = selectedSeats;
  get("payment-total").textContent = money(selectedTotal);
  showPage("payment");
}

function finishPayment() {
  if (!selectedSeats) {
    alert(get("booking-page").getAttribute("data-seat-error"));
    return false;
  }

  var ticket = {
    movieId: currentMovieId,
    name: get("customer-name").value,
    seats: selectedSeats,
    total: selectedTotal,
    id: "01"
  };

  sessionStorage.setItem("tickets", JSON.stringify(ticket));
  showSuccess(ticket);
  return false;
}

function makeTicket(ticket, isSuccess) {
  var movie = findMovie(ticket.movieId);
  var card = document.importNode(get("ticket-template").content, true).firstElementChild;

  card.getElementsByClassName("ticket-movie")[0].textContent = movie.name;
  card.getElementsByClassName("ticket-id")[0].textContent = ticket.id;
  card.getElementsByClassName("ticket-name")[0].textContent = ticket.name;
  card.getElementsByClassName("ticket-seats")[0].textContent = ticket.seats;
  card.getElementsByClassName("ticket-total")[0].textContent = money(ticket.total);

  if (isSuccess) {
    card.getElementsByClassName("ticket-status")[0].hidden = false;
    var action = card.getElementsByClassName("ticket-action")[0];
    action.hidden = false;
    action.onclick = showTickets;
  }

  return card;
}

function showSuccess(ticket) {
  showPage("success");
  get("success-info").replaceChildren(makeTicket(ticket, true));
}

function showTickets() {
  showPage("tickets");

  var list = get("ticket-list");
  var ticketText = sessionStorage.getItem("tickets");

  if (ticketText == null) {
    list.replaceChildren(document.importNode(get("no-ticket-template").content, true));
    return;
  }

  var tickets = JSON.parse(ticketText);
  if (tickets.length == null) tickets = [tickets];

  list.replaceChildren();
  for (var i = 0; i < tickets.length; i++) {
    list.appendChild(makeTicket(tickets[i], false));
  }
}