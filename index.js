import fileStructure from './filenames.js'


const toggleButton = document.querySelector('.toggle');
const navLinks = document.querySelector('nav ul');
const navItems = document.querySelectorAll('nav ul li a');
const subNavItems = document.querySelectorAll('nav ul li a ul li a');
let maintitles = [];

window.addEventListener("load", init);

function init() {

  toggleButton.addEventListener('click', toggleNav);

  navItems.forEach(navItem => {
    navItem.addEventListener('click', toggleNav);
  });

  navItems.forEach(subNavItems => {
    subNavItems.addEventListener('click', toggleNav);
  });

  generateContent(fileStructure());

}

function toggleNav() {
  navLinks.classList.toggle('show');
}


function generateContent(fileStruct) {
  const mainUl = document.querySelector('nav ul');
  let counter = 0;
  const classBgs = ["bg-1-grad", "bg-2-grad"];
  const contentElement = document.getElementById("content");
  for (const key in fileStruct) {
    let titleInKey = key.split(" - ")[0];
    maintitles[maintitles.length] = titleInKey;
    let navLi = document.createElement("li");
    let navA = document.createElement("a");
    navA.textContent = titleInKey;
    navA.href = `#${titleInKey}`;
    navLi.appendChild(navA);
    mainUl.appendChild(navLi);


    let initalPath;
    const sectionElement = document.createElement("section");
    const title = document.createElement("h2");
    title.textContent = convertToTitleCase(key);
    sectionElement.appendChild(title);

    sectionElement.className = classBgs[counter % 2];
    const sectionContent = fileStruct[key];
    sectionElement.id = key.split(" - ")[0];;
    if (Array.isArray(sectionContent)) {
      
      initalPath = `./images/${key}/`;
      const toAdd = generateSection(sectionContent, initalPath);
      sectionElement.appendChild(toAdd);
    } else if (typeof sectionContent === 'object' && sectionContent !== null) {
      for (const subKey in sectionContent) {
        initalPath = `./images/${key}/${subKey}/`;
        sectionElement.appendChild(generateSubsection(subKey, sectionContent[subKey], initalPath));
      }
    } else {
      console.log(`${key} contains an unexpected value type:`, sectionContent);
    }
    contentElement.appendChild(sectionElement);
    counter++
  };
}


function generateSubsection(key, content, path) {
  const subsectionElement = document.createElement("div");
  subsectionElement.id = key;
  const title = document.createElement("h3");
  title.textContent = convertToTitleCase(key);
  subsectionElement.appendChild(title);
  subsectionElement.appendChild(generateSection(content, path))
  return subsectionElement;

}

function convertToTitleCase(str) {
  if (!str) {
    return ""
  }
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

function generateSection(fileList, path) {
  let sectionContainer = document.createElement("div");
  sectionContainer.className = "grid-container";
  let counter = 0;
  for (const imgName of fileList) {
    let item = createGridItem(imgName, path, counter);
    sectionContainer.appendChild(item);
    counter++;
  }
  return sectionContainer;
}


function createGridItem(filename, path, counter) {

  let item = document.createElement('div');
  item.classList.add("grid-item");
  item.classList.add(`${counter % 2 == 0 ? "green" : "dirt"}`);

  let filetype  = filename.slice(-3); //last 3 chars of the filename
  let elementToMake = document.createElement(filetype == "mp4"? "video" :"img");

  if (filetype == "mp4") {  
    elementToMake.type = "video/mp4"; 
    elementToMake.loop = true;
    item.addEventListener('click', (e) => playvideo(e));;
  } 
    
  elementToMake.src = `${path}${filename}`;
  item.appendChild(elementToMake);
  item.addEventListener('click', (e) => toggleGridItem(e));

  return item;
}

function playvideo(e){
  let item = e.target.tagName == "VIDEO" ? e.target : e.target.getElementsByTagName("video")[0];
  if (item.paused) 
    item.play(); 
  else 
    item.pause(); 
}

// Function to toggle grid item size
function toggleGridItem(e) {
  let item = e.target.tagName == "DIV" ? e.target : e.target.parentElement;
  let itemMedia = item.firstChild;
  let mediaFile = getFileNameFromPath(itemMedia.src);

  let navElementStyle = document.getElementById("navigation").getBoundingClientRect();

  // First, remove the expanded class from any previously expanded item
  document.querySelectorAll('.grid-item.expanded').forEach(el => {
    if (el.innerHTML != item.innerHTML) {
      el.classList.remove('expanded');
      el.style.top = ''; // Reset the top position
    }
  });

  item.classList.toggle('expanded');
  if (item.classList.contains("expanded")) {
    let pieceTitle = extractTextFromParentheses(mediaFile);
    if (pieceTitle != null) {
      let pieceH = document.createElement('H4');
      pieceH.textContent = pieceTitle;
      console.log(pieceH.textContent);
      item.appendChild(pieceH);
      
    }
    
  }else{
    let pieceTitle = item.getElementsByTagName('H4');
    if (pieceTitle.length > 0) {
      item.removeChild(pieceTitle[0]);
      
    }
  }
  
  

  // Get the bounding rectangle of the grid item
  const rect = item.getBoundingClientRect();

  // Get the current scroll position
  const scrollY = window.scrollY;

  // Calculate the position to keep the expanded item within the current viewport
  let topPosition = rect.top + scrollY;

  // Check if the item is going to be expanded outside of the viewport
  if (rect.top < 0) {
    topPosition = scrollY + (navElementStyle.height / 2); // Align to the top of the viewport
  } else if (rect.bottom > window.innerHeight) {
    // If bottom of item goes below the viewport, adjust to keep it in view
    topPosition = scrollY + (window.innerHeight / 2) - (rect.height / 2);
  }

  // Set the top position of the expanded item
  item.style.top = `${topPosition}px`;

}
function getFileNameFromPath(path) {
  // Find the last index of either '\' or '/'
  const lastBackslashIndex = path.lastIndexOf('\\');
  const lastSlashIndex = path.lastIndexOf('/');
  
  // Choose the maximum index
  const lastIndex = Math.max(lastBackslashIndex, lastSlashIndex);

  // Extract the file name using substring
  const fileName = path.substring(lastIndex + 1);
  
  return fileName;
}

function extractTextFromParentheses(input) {
  // Step 1: Replace all "%20" with spaces
  const cleanedString = input.replace(/%20/g, " ");

  // Step 2: Extract the text between the first "(" and ")"
  const match = cleanedString.match(/\(([^)]+)\)/);

  // Step 3: Return the extracted text or null if no match is found
  return match ? match[1] : null;
}
