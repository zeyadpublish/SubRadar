var subsArray = [];
var currentCurr = "USD";

var rates = {
    "USD": 1,
    "AED": 3.67,
    "EUR": 0.91,
    "GBP": 0.78,
    "SAR": 3.75,
    "EGP": 49.30
};

window.onload = function() {
    var dateObj = new Date();
    var dd = String(dateObj.getDate()).padStart(2, '0');
    var mm = String(dateObj.getMonth() + 1).padStart(2, '0'); 
    var yyyy = dateObj.getFullYear();
    var minDateStr = yyyy + '-' + mm + '-' + dd;
    document.getElementById("subDate").setAttribute("min", minDateStr);

    fetch('https://api.exchangerate-api.com/v4/latest/USD')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        rates = data.rates;
        if(document.getElementById("app-wrapper").style.display == "block") {
            loadData();
        }
    })
    .catch(function(error) {
        console.log(error);
    });

    var logged = localStorage.getItem("isLogged");
    if(logged == "yes") {
        document.getElementById("auth-wrapper").style.display = "none";
        document.getElementById("app-wrapper").style.display = "block";
        
        var savedDB = localStorage.getItem("mySubsDB");
        if(savedDB != null) {
            subsArray = JSON.parse(savedDB);
        }
        loadData();
    }
};

function doLogin() {
    var u = document.getElementById("loginUser").value;
    var p = document.getElementById("loginPass").value;
    
    if(u == "" || p == "") {
        alert("Please enter both username and password.");
        return;
    }
    
    localStorage.setItem("isLogged", "yes");
    
    document.getElementById("auth-wrapper").style.display = "none";
    document.getElementById("app-wrapper").style.display = "block";
    
    var savedDB = localStorage.getItem("mySubsDB");
    if(savedDB != null) {
        subsArray = JSON.parse(savedDB);
    }
    loadData();
}

function signOut() {
    localStorage.removeItem("isLogged");
    window.location.reload();
}

function changeCurrency() {
    currentCurr = document.getElementById("currSelect").value;
    document.getElementById("currLabel").innerText = currentCurr;
    loadData();
}

function loadData() {
    var listHtml = document.getElementById("the-list");
    listHtml.innerHTML = "";
    var total = 0;

    if(subsArray.length == 0) {
        listHtml.innerHTML = '<div class="empty-state">No active subscriptions. Add your first one!</div>';
        document.getElementById("totalburn").innerText = "0.00";
        return;
    }

    subsArray.sort(function(a, b){
        return new Date(a.d) - new Date(b.d);
    });

    for(var i=0; i<subsArray.length; i++) {
        var rateMult = rates[currentCurr] || 1;
        var convertedPrice = subsArray[i].price * rateMult;
        total = total + convertedPrice;
        
        var today = new Date();
        var subDate = new Date(subsArray[i].d);
        var diff = subDate.getTime() - today.getTime();
        var daysLeft = Math.ceil(diff / (1000 * 3600 * 24));

        var cl = "days-green";
        if(daysLeft <= 7) { cl = "days-yellow"; }
        if(daysLeft <= 0) { cl = "days-red"; }

        var textDays = daysLeft + " days left";
        if(daysLeft <= 0) { textDays = "BILLS TODAY"; }

        var html = '<div class="sub-card">';
        html += '<div class="sub-info">';
        html += '<h4>' + subsArray[i].title + '</h4>';
        html += '<p>Cost: <strong>' + convertedPrice.toFixed(2) + ' ' + currentCurr + '</strong></p>';
        html += '</div>';
        html += '<div class="sub-actions">';
        html += '<span class="badge ' + cl + '">' + textDays + '</span>';
        html += '<button class="btn-danger" onclick="deleteItem(' + subsArray[i].id + ')">Delete</button>';
        html += '</div></div>';

        listHtml.innerHTML += html;
    }

    document.getElementById("totalburn").innerText = total.toFixed(2);
}

function deleteItem(idd) {
    var temp = [];
    for(var x=0; x<subsArray.length; x++) {
        if(subsArray[x].id != idd) {
            temp.push(subsArray[x]);
        }
    }
    subsArray = temp;
    
    localStorage.setItem("mySubsDB", JSON.stringify(subsArray));
    loadData();
}

function addSub() {
    var n = document.getElementById("subName").value;
    var p = document.getElementById("subPrice").value;
    var dt = document.getElementById("subDate").value;

    if(n == "" || p == "" || dt == "") {
        document.getElementById("errorText").innerText = "Please fill in all fields.";
        return;
    }
    
    var inputDate = new Date(dt);
    var now = new Date();
    now.setHours(0,0,0,0);

    if(inputDate < now) {
        document.getElementById("errorText").innerText = "Cannot use past dates!";
        return;
    }

    document.getElementById("errorText").innerText = "";

    var newObj = {
        id: Date.now(),
        title: n,
        price: parseFloat(p),
        d: dt
    };

    subsArray.push(newObj);
    
    localStorage.setItem("mySubsDB", JSON.stringify(subsArray));
    
    document.getElementById("subName").value = "";
    document.getElementById("subPrice").value = "";
    document.getElementById("subDate").value = "";
    
    loadData();
}