document.addEventListener('DOMContentLoaded', function () {
    const newsRssUrl = 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'; // Example NY Times RSS URL
    const dealsRssUrl = 'https://www.redflagdeals.com/rss/category/hot-deals/'; // Example deals RSS URL
    const holidaysUrl = 'https://date.nager.at/api/v2/PublicHolidays/2024/CA';
    const newsTickerContainer = document.getElementById('news-ticker-container');
    const dealsTickerContainer = document.getElementById('deals-ticker-container');
    const holidaysList = document.getElementById('holidays-list');

    // Function to fetch RSS feed and parse items
    function fetchRssFeed(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(data, 'application/xml');
                const items = xml.querySelectorAll('item');
                const headlines = [];
                items.forEach(item => {
                    const title = item.querySelector('title').textContent;
                    const description = item.querySelector('description').textContent;
                    const link = item.querySelector('link').textContent;
                    headlines.push({ title, description, link });
                });
                return headlines;
            })
            .catch(error => {
                console.error(`Error fetching RSS feed from ${url}:`, error);
                return [];
            });
    }

    // Function to display headlines in a ticker
    function displayTicker(container, headlines) {
        let currentIndex = 0;

        function showHeadline() {
            container.innerHTML = '';
            const headline = headlines[currentIndex];
            const tickerItem = document.createElement('div');
            tickerItem.className = 'ticker-item active';
            tickerItem.innerHTML = `<a href="${headline.link}" target="_blank">${headline.title}: ${headline.description}</a>`;
            container.appendChild(tickerItem);

            setTimeout(() => {
                tickerItem.classList.remove('active');
                currentIndex = (currentIndex + 1) % headlines.length;
                showHeadline();
            }, 3000); // Change headline every 3 seconds
        }

        if (headlines.length > 0) {
            showHeadline();
        } else {
            container.innerHTML = `<h1>No headlines found</h1>`;
        }
    }

    // Fetch and display Canadian news RSS feed
    fetchRssFeed(newsRssUrl).then(headlines => {
        if (headlines.length > 0) {
            displayTicker(newsTickerContainer, headlines);
        } else {
            newsTickerContainer.innerHTML = `<h1>Error fetching Canadian News RSS feed</h1>`;
        }
    });

    // Fetch and display Deals RSS feed
    fetchRssFeed(dealsRssUrl).then(headlines => {
        if (headlines.length > 0) {
            displayTicker(dealsTickerContainer, headlines);
        } else {
            dealsTickerContainer.innerHTML = `<h1>Error fetching Deals RSS feed</h1>`;
        }
    });

    // Fetch upcoming Canadian holidays
    fetch(holidaysUrl)
        .then(response => response.json())
        .then(data => {
            const now = new Date();
            const upcomingHolidays = data.filter(holiday => new Date(holiday.date) >= now);
            const holidays = upcomingHolidays.slice(0, 10); // Get only the first 10 upcoming holidays
            holidays.forEach(holiday => {
                const holidayItem = document.createElement('li');
                holidayItem.textContent = `${holiday.date} - ${holiday.localName}`;
                holidaysList.appendChild(holidayItem);
            });
        })
        .catch(error => {
            holidaysList.innerHTML = `<li>Error fetching holidays</li>`;
            console.error('Error fetching holidays:', error);
        });

    // Clock Functionality
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // The hour '0' should be '12'
        const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
        document.getElementById('Clock').textContent = timeString;
    }

    setInterval(updateClock, 1000);
    updateClock();


   

});
