This project is a simple interactive map built with React, Leaflet, and OpenStreetMap for my CS465 Lab 2
 
This site will allow you to click on a map and add locations that you have been 
When clicking on the desired location in the map you will be prompted with adding a title and details for this title
This will then add that location to the list with the details provided 
You can track any favorite or important locations here and have a list to reference 
The pings will be viewed on the map as well for easy traversal 

Setup and Run Instructions
Clone the repository git clone https://github.com/kstone4216/cs465-lab2
cd leaflet-places
npm install
npm run dev
npm run build



Technologies Used
React (Vite build tool)
Leaflet.js for map rendering
react-leaflet for React integration
OpenStreetMap for free map tiles
CSS for layout and responsive design




Dev notes
The leaf places and open street map api was very helpful for getting a start on the map it came with all of the assets I needed as well 

Managing the use state can be difficult with dynamic things like markers and you need to keep changing the state based on the button clicks which is much easier done using react 

When I added functions like handleAdd or handleReset, I had to learn that they can’t directly “return” something to the screen instead, they update state using setState (in this case, setPlaces or setMode). Then React automatically re-renders the component and updates what’s displayed

Author
Kaden Stone
Southern New Hampshire University – CS465 Web Development
Fall 2025