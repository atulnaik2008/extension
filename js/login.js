let compProfilePictureButton = "";
let datashowUserProLogo = "";
let datashowCompLogo = "";
let profilePictureButton = "";
let customButtonModel = "";
let isScraped = false;
let storedexistingTags = [];

const sharedStyles = `
  label {
    color: #ccc;
  }

  #custom-popup {
    top: 50%;
    left: 86%;
    transform: translate(-50%, -50%);
    background: white;
    width: 340px;
    height: 500px;
    position: fixed;
    overflow: auto;
    scrollbar-width: thin;
  }

  /* Adjust scrollbar appearance for Firefox */
  #custom-popup::-webkit-scrollbar {
    width: 8px;
    display: none;
  }

  /* Track for Firefox */
  #custom-popup::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  /* Thumb/dragger for Firefox */
  #custom-popup::-webkit-scrollbar-thumb {
    background: #888;
  }

  @import url(https://fonts.googleapis.com/css?family=Roboto:300);
  header .header {
    background-color: #fff;
    height: 45px;
  }

  header a img {
    width: 134px;
    margin-top: 4px;
  }

  .login-page {
    padding: 8% 0 0;
    margin: auto;
  }

  .form {
    margin-top: -26px;
    height: 492px;
    width: 332px;
    position: relative;
    z-index: 1;
    background: #fff;
    padding: 36px;
    text-align: center;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
  }

  .form input {
    font-family: "Roboto", sans-serif;
    outline: 0;
    background: #f2f2f2;
    width: 100%;
    border: 0;
    margin: 0 0 15px;
    padding: 15px;
    box-sizing: border-box;
    font-size: 14px;
  }

  .form button {
    font-family: "Roboto", sans-serif;
    text-transform: uppercase;
    outline: 0;
    background-color: #328f8a;
    width: 100%;
    border: 0;
    padding: 15px;
    color: #fff;
    font-size: 14px;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .container {
    position: relative;
    z-index: 1;
    max-width: 300px;
    margin: 0 auto;
  }

  #formData {
    padding-top: 127px;
  }
  .logo {
          background-image: url(https://mokapen.com/image/cover/cover.jpg);
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          width: 200px;
          height: auto;
          display: block;
          margin: 5px;
          padding: 6px;
          border-radius: 5px;
          margin-left: 2px;
        }
        
`;

// Function to create the custom button
function createCustomButton() {
  let customButton = document.createElement("button");
  customButton.style =
    "font-weight: bold; background-color: #0A66C2; color: white; padding: 9px 9px; border: none; border-radius: 40px; margin-left: 7px;";
  customButton.id = "addmokapen";
  customButton.innerText = "Add To Mokapen";
  return customButton;
}

function appendButtonWhenReady() {
  const ctasSection = document.querySelector(
    ".oCkwyHrPSFeGjCTDDxHnJoUsCvFeRZbFaOM"
  );
  if (ctasSection && !document.getElementById("addmokapen")) {
    const customButton = createCustomButton();
    ctasSection.appendChild(customButton);

    customButton.addEventListener("click", function () {
      // Send message to background script to get the cookie
      chrome.runtime.sendMessage({ type: "getCookies" }, (response) => {
        if (response) {
          if (response.accessToken && response.extension_org_id) {
            console.log("Access Token retrieved: ", response.accessToken);
            console.log("Org Token retrieved: ", response.extension_org_id);

            // Store the tokens in local storage
            chrome.storage.local.set(
              {
                yourTokenKey: response.accessToken,
                orgTokenKey: response.extension_org_id,
              },
              function () {
                console.log("Tokens are saved");

                // Retrieve the tokens from local storage
                chrome.storage.local.get(
                  ["yourTokenKey", "orgTokenKey"],
                  function (result) {
                    console.log("Local storage retrieval result:", result); // Debug statement
                    const retrievedToken = result.yourTokenKey;
                    const retrievedOrgToken = result.orgTokenKey;
                    console.log("Retrieved Token:", retrievedToken); // Debug statement
                    console.log("Retrieved Org Token:", retrievedOrgToken);

                    if (retrievedToken && retrievedOrgToken) {
                      console.log(
                        "Tokens retrieved:",
                        retrievedToken,
                        retrievedOrgToken
                      );

                      // Call the API to check for large premium payments
                      checkLargePremiumPayments(
                        retrievedToken,
                        retrievedOrgToken
                      )
                        .then((isAccessible) => {
                          if (isAccessible) {
                            console.log(
                              "Data value is between 5 and 5.999 (inclusive)"
                            );
                            // Load alternate HTML content after successful check
                            loadCustomHTMLContent();
                          } else {
                            console.log(
                              "Data value is not between 5 and 5.999"
                            );
                            // Do not load alternate HTML content
                            alert(
                              "This customer is not paying the Large Premium"
                            );
                            loadAlternateHTMLContent();
                          }
                        })
                        .catch((error) => {
                          console.error(
                            "Error checking large premium payment:",
                            error
                          );
                          // Do not load alternate HTML content on error
                          loadAlternateHTMLContent();
                        });
                    } else {
                      console.log("Tokens not found or undefined");
                      // Load alternate HTML content
                      loadAlternateHTMLContent();
                    }
                  }
                );
              }
            );
          } else {
            console.log("Access Token or Org Token not found");
            // Load alternate HTML content
            loadAlternateHTMLContent();
          }
        } else {
          console.log("No response received");
          // Load alternate HTML content
          loadAlternateHTMLContent();
        }
      });
    });
  }
}

// Function to check for large premium payments with retry and exponential backoff
function checkLargePremiumPayments(token, orgToken, retryCount = 0) {
  const apiUrl = `https://dev.mokapen.uno/api/v1/check_org_is_largely_premiumed/${orgToken}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  return new Promise((resolve, reject) => {
    fetch(apiUrl, {
      method: "GET",
      headers: headers,
    })
      .then((response) => {
        if (response.status === 429) {
          console.error("Too many requests error:", response);
          if (retryCount < 5) {
            const retryAfter = Math.pow(2, retryCount) * 1000; // Exponential backoff
            console.log(`Retrying after ${retryAfter} ms...`);
            setTimeout(() => {
              checkLargePremiumPayments(token, orgToken, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, retryAfter);
          } else {
            reject("Too many requests. Please try again later.");
          }
        } else if (response.ok) {
          return response.json(); // Get the JSON response
        } else {
          console.error("Response not OK:", response);
          reject(`Request failed with status ${response.status}`);
        }
      })
      .then((data) => {
        console.log("API response data:", data); // Debug statement to check the data
        if (data && data.success) {
          const value = parseFloat(data.data);
          if (value >= 5 && value < 6) {
            resolve(true); // Resolve true if the value is between 5 and 5.999
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error); // Log any fetch errors
        reject(error);
      });
  });
}

function loadAlternateHTMLContent() {
  const ctasmodelPopup = document.querySelector("body");
  if (ctasmodelPopup) {
    const alternateButtonModel = document.createElement("div");

    // Fetch alternate CSS files and apply them dynamically
    Promise.all([
      fetch(
        "https://cors-anywhere.herokuapp.com/https://mokapen.com/vendor/alternate/css/bootstrap.min.css"
      ),
      fetch(
        "https://cors-anywhere.herokuapp.com/https://mokapen.com/css/alternate/vendors.css"
      ),
      fetch(
        "https://cors-anywhere.herokuapp.com/https://mokapen.com/css/alternate/custom.css"
      ),
    ])
      .then((responses) =>
        Promise.all(responses.map((response) => response.text()))
      )
      .then((cssContents) => {
        // Create style elements for each alternate CSS file and append them to the head
        cssContents.forEach((cssContent) => {
          const style = document.createElement("style");
          style.textContent = cssContent;
          document.head.appendChild(style);
        });

        // Now that alternate CSS files are loaded, add your alternate HTML content
        alternateButtonModel.innerHTML = `
         <style>
     ${sharedStyles}
    </style>
       <div id="custom-popup" class="login-container" style="position: fixed; z-index: 10000 !important; border-radius: 10px;    scrollbar-width: thin; /* Adjust the width of the scrollbar */
          scrollbar-width: none; border: 4px solid #c7c9e1;">
                 <img src="https://mokapen.com/image/logo/mokapen-logotype-light-sm.png" alt="Mokapen Logo" class="logo" style=" margin-left: 10px;">
            <div class="login-page">
                    <div class="form" id="formData">
                      <div class="login">
                        <div class="login-header">
                          <h3><b>SIGN IN</b></h3>
                          <p style="font-weight:2px;">Choose your preferred way to get in</p>
                        </div>
                      </div>
                      <form class="login-form">
                        <p class="message">First Login <a href="https://mokapen.com/en/login" target="_blank"><button type="button" class="Login">Login</button></a></p>
                      </form>
                    </div>
                  </div>
               </div>
        `;

        ctasmodelPopup.appendChild(alternateButtonModel);
      })
      .catch((error) => console.error("Error loading alternate CSS:", error));
  }
}

function getDesignationData() {
  // Select the second li element with the specific class using XPath
  const designationElement = document.evaluate(
    '(//li[contains(@class, "artdeco-list__item")])[2]',
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  // Check if the designation element exists
  if (designationElement) {
    // Select the element with aria-hidden="true" directly within the designation element
    const designationHiddenElement = designationElement.querySelector(
      '.t-bold [aria-hidden="true"]'
    );

    // Check if the element with aria-hidden="true" exists
    if (designationHiddenElement) {
      // Get the text content of the element
      const designationValue = designationHiddenElement.textContent.trim();
      console.log("designation Value:", designationValue);
      return designationValue;
    } else {
      console.log(
        "No element with aria-hidden='true' found within the designation element."
      );
    }
  } else {
    console.log("designation element not found.");
  }

  return "";
}

function getUserProfilePictureSrc() {
  const imageElement = document.querySelector(
    ".pv-top-card-profile-picture__container.display-block img"
  );
  if (imageElement) {
    const src = imageElement.getAttribute("src");
    console.log(src);
    return src;
  } else {
    console.log("Image element not found");
    return null;
  }
}
// Call the function to get the image source
const imageUrl = getUserProfilePictureSrc();

function getFirstImageSrcText() {
  const imageElements = document.querySelector(
    ".pv-text-details__right-panel .evi-image"
  );
  if (imageElements) {
    const src = imageElements.getAttribute("src");
    console.log("this is first images", src);
    return src;
  } else {
    console.log("Image element not found");
    return null;
  }
}
// Call the function to get the image source
const imageUrls = getFirstImageSrcText();

// Company Name data scraping
function getCompanyNameData() {
  // Check if the user has a title or a company role
  if (document.querySelector(".pv-text-details__right-panel li:first-child")) {
    return document.querySelector(
      ".pv-text-details__right-panel li:first-child"
    ).innerText;
  } else if (
    document.querySelector(".pv-text-details__right-panel li:first-child")
  ) {
    return document.querySelector(
      ".pv-text-details__right-panel li:first-child"
    ).innerText;
  }
  return "";
}

function loadCustomHTMLContent() {
  const ctasmodelPopup = document.querySelector("body");
  if (ctasmodelPopup) {
    const customButtonModel = document.createElement("div");

    // Fetch CSS files and apply them dynamically
    // Promise.all([
    //   fetch(
    //     "https://cors-anywhere.herokuapp.com/https://mokapen.com/vendor/bootstrap/css/bootstrap.min.css?v=1.82"
    //   ),
    //   fetch(
    //     "https://cors-anywhere.herokuapp.com/https://mokapen.com/css/vendors.css?v=1.82"
    //   ),
    //   fetch(
    //     "https://cors-anywhere.herokuapp.com/https://mokapen.com/css/custom.css?v=1.82"
    //   ),
    // ])
    //   .then((responses) =>
    //     Promise.all(responses.map((response) => response.text()))
    //   )
    //   .then((cssContents) => {
    //     // Create style elements for each CSS file and append them to the head
    //     cssContents.forEach((cssContent) => {
    //       const style = document.createElement("style");
    //       style.textContent = cssContent;
    //       document.head.appendChild(style);
    //     });
    //   })
    //   .catch((error) => console.error("Error loading CSS:", error));

    customButtonModel.innerHTML = `
        <style>
          ${sharedStyles}
          /* Additional styles specific to loadCustomHTMLContent */
          
  
          .inboxproperties {
            display: inline-block;
            padding: 3px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background-color: #fff;
            width: 315px;
            height: 35px;
            box-sizing: border-box;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-height: 2em;
            line-height: 1.4em;
            cursor: text;
          }
  
          .tag-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
  
          .tag {
            background-color: #e0e0e0;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 5px 10px;
            display: flex;
            align-items: center;
            margin: 5px 0;
            font-size: 14px;
          }
          .updateButton, .storeButton {
              display: none;
          }
  
          .button-container {
              margin-left: 10px;
              display: flex;
              gap: 10px; /* Adjust spacing between buttons */
              align-items: center;
          }
  
        </style>
        <div id="custom-popup" class="login-container" style="position: fixed; z-index: 10000 !important; border-radius: 10px;    scrollbar-width: thin; /* Adjust the width of the scrollbar */
            scrollbar-width: none; border: 4px solid #c7c9e1;">
        <img src="https://mokapen.com/image/logo/mokapen-logotype-light-sm.png" alt="Mokapen Logo" class="logo" style=" margin-left: 10px;">
        <div class="button-container">
        <button id="scrapeAllData" style="display:none" >Scraped Data</button>
                 <button id="scrapeDataStore" class="btn_brand storeButton">Store Data</button>
          <button id="scrapeDataUpdate" class="btn_brand updateButton" >Update Data</button>
          <button id="scrapeReadData" style="display:none" >Read Data</button>
          <button  class="customContactInfoButton btn_brand mainButton" onclick="handleClick()">Show Contact Info</button>
          </div>
         <table style="margin-left: 10px;">
         <thead>
           <tr>
             <th>
             <!-- <label>User Profile</label> -->
               <span
                 class="datashowUserProLogo"
                 contentEditable="false"
                 style="display: none"
               ></span>
               <img
                 id="UserDisplay"
                 class="dummyImage"
                 src="/image/dummy.jpg"
                 alt="User Profile" 
                 style="height: 96px; width: 105px; border-radius: 283px; margin-top: 10px;"
               />
               </th>
           </tr>
           <tr>
          <th>
            <div class="field">
              <label class="label" style="padding-left: 12px;
              font-size: 14px;">User Designation</label>
              <div class="control">
                <span class="datashowDesignation inboxproperties" contentEditable="true" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
         </thead>
         <thead>
           <tr>
             <th>
               <span
                 class="datashowCompLogo"
                 contentEditable="false"
                 style="display: none"
               ></span>
               <img
                 id="CompanyDisplay"
                 class="dummyLogo"
                 src="/image/logo.png"
                 alt="User Logo"
                 style="height: 96px; width: 105px ;border-radius: 283px; margin-top: 10px;"
               />
             </th>
           </tr>
         <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">Company Name</label>
              <div class="control">
                <span class="datashowCompName inboxproperties" contentEditable="true" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
           </thead>  
         <thead>
         <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">User Email</label>
              <div class="control">
                <span class="datashowUserEmail inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">User Url</label>
              <div class="control">
                <span class="datashowUserUrl inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">User Mobile Number</label>
              <div class="control">
                <span class="datashowUserMobileNum inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">First Name</label>
              <div class="control">
              <span class="datashowUserFirstName inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">Last Name</label>
              <div class="control">
                <span class="datashowUserLastName inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">Type</label>
              <div class="control">
                <span class="datashowUsertype inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">Type 2</label>
              <div class="control">
                <span class="datashowUsertypetwo inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">Job Role</label>
              <div class="control">
                <span class="datashowUserjobrole inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">Phone</label>
              <div class="control">
                <span class="datashowUserphone inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">Description</label>
              <div class="control">
                <span class="datashowUserdescription inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">Address</label>
              <div class="control">
                <span class="datashowUseraddress inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">Company</label>
              <div class="control">
                <span class="datashowUsercompany inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">First Name</label>
              <div class="control">
                <span class="datashowUserfname inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>
            <div class="field">
              <label class="label" style="font-size: 12px;">Last Name</label>
              <div class="control">
                <span class="datashowUserlname inboxproperties" contentEditable="false" style="font-weight: 400; display: block; margin-top: 5px;"></span>
              </div>
            </div>
          </th>
        </tr>
              <tr>
                  <th>
                  <label class="label" style="font-size: 12px;">Privacy</label>
                    <!-- Add the toggle button -->
                    <div class="switch" style="border: 1px solid white!important;
                    border-radius: 13px !important; padding-left: 3px;">
                        <input type="checkbox" id="privacyToggle" class="datashowUserprivacy" />
                        <label class="slider" for="privacyToggle" style="margin-top: 4px !important;"></label>
                    </div>
                    <span class="statusText" style="font-weight: 400;"></span>
                </th>
              </tr>
              <tr>
                <th>
                  <div class="field">
                    <label class="label" style="font-size: 12px;">Tags</label>
                    <div class="control">
                      <input type="text" style="font-size: 14px; max-height: 2em;" id="tagInput"placeholder="Enter tag">
                      <div class="dropdown-content" id="tagDropdown"></div>
                      <button class="label" style="font-size: 12px; margin-top: 8px;" id="addTagButton">Add Tag</button><br>
                      <div class="tag-container" style="margin-top: 10px; width: fit-content; " id="tagContainer"></div>
                      <span class="datashowUsertagname" style="font-weight: 400; display: block; margin-top: 5px;"></span>
                      <div class="element"></div>
                      <div class="datashowUsertagname"></div>
                    </div>
                  </div>
                </th>
              </tr>
       </thead>
         </table>
         </div>
        
      `;

    ctasmodelPopup.appendChild(customButtonModel);

    // Function to close the model
    function closeModel() {
      const popup = document.getElementById("custom-popup");
      if (popup) {
        popup.remove();
        console.log("Model closed.");
      }
    }

    // Function to check if the URL is a LinkedIn profile URL and close the model if it is
    function checkAndCloseModel(url) {
      console.log("Checking URL:", url);
      if (url.includes("linkedin.com/in/")) {
        closeModel();
      }
    }

    // Store the initial URL
    let prevUrl = window.location.href;

    // Create a MutationObserver instance
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      console.log("Previous URL:", prevUrl);
      console.log("Current URL:", currentUrl);
      if (currentUrl !== prevUrl) {
        checkAndCloseModel(currentUrl);
        prevUrl = currentUrl;
      }
    });

    // Configure the observer to watch for changes in the attribute of the 'href' property of 'a' elements
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["href"],
      subtree: true,
    });

    // Add event listener to the search box to close the popup on click
    const searchBox = document.getElementById("global-nav-typeahead");
    if (searchBox) {
      searchBox.addEventListener("click", function () {
        closeModel();
      });
    }

    // Event listener for the 'Show Contact Info' button
    let isScraped = false;

    document
      .querySelector(".customContactInfoButton")
      .addEventListener("click", function () {
        // Check if 'Scraped Data' button has already been triggered
        if (!isScraped) {
          // Set flag to true to indicate button has been triggered
          isScraped = true;

          // Function to get cookies session org
          function getCookiesSessionOrg() {
            chrome.runtime.sendMessage({ type: "getCookies" }, (response) => {
              if (response && response.extension_org_id) {
                const cookiesessionOrg = response.extension_org_id;
                console.log(
                  "Cookies Session Org Token retrieved: ",
                  cookiesessionOrg
                );
              } else {
                console.log(
                  "Cookies Session Org Token not found in the response"
                );
              }
            });
          }

          // Automatically trigger 'Scraped Data' button after 3 seconds
          setTimeout(function () {
            document.getElementById("scrapeAllData").click();
            console.log("Clicked scrapeAllData 3000");

            // Call getCookiesSessionOrg function immediately after clicking scrapeAllData
            getCookiesSessionOrg();
          }, 3000); // 3000 milliseconds delay

          setTimeout(function () {
            document.getElementById("scrapeReadData").click();
            console.log("Clicked Scrape Read Data 5000");

            // Set an interval to call the function every 2 seconds (2000 milliseconds)
            setInterval(getCookiesSessionOrg, 2000);
          }, 5000); // 5000 milliseconds delay
        }
      });

    // Add event listener to the inner button to simulate click on LinkedIn profile contact info link
    const contactInfoButton = document.querySelector(
      ".customContactInfoButton"
    );

    if (contactInfoButton) {
      contactInfoButton.addEventListener("click", function () {
        // Simulate a click to open the contact info modal
        const contactInfoLink = document.getElementById(
          "top-card-text-details-contact-info"
        );
        if (contactInfoLink) {
          contactInfoLink.click();
        } else {
          console.log("LinkedIn contact info link not found.");
          return;
        }

        // Wait for a specific time (e.g., 5 seconds) and then close the modal automatically
        setTimeout(function () {
          const closeModalButton = document.querySelector(
            ".artdeco-modal__dismiss"
          );
          if (closeModalButton) {
            closeModalButton.click();
          } else {
            console.log("Close modal button not found.");
          }
        }, 4000); // Adjust the time as needed
      });
    }

    // Get the designation scrape data
    const extractedData = getDesignationData();
    console.log(extractedData);
    customButtonModel.querySelector(".datashowDesignation").innerText =
      extractedData;
    console.log(customButtonModel);

    //User profile scrape data
    const extractedProfilePictureSrc = getUserProfilePictureSrc();
    const imgElement = document.getElementById("UserDisplay");
    console.log("user data", extractedProfilePictureSrc);
    customButtonModel.querySelector(".datashowUserProLogo").innerText =
      extractedProfilePictureSrc;
    console.log(customButtonModel);
    datashowUserProLogo.innerText = extractedProfilePictureSrc;
    if (imgElement) {
      console.log(
        "imgElement.setAttribute",
        imgElement.setAttribute("src", extractedProfilePictureSrc)
      );
      imgElement.setAttribute("src", extractedProfilePictureSrc);
    }

    // Get the Company name data
    const extractedCompanyNameData = getCompanyNameData();
    console.log(extractedCompanyNameData);
    customButtonModel.querySelector(".datashowCompName").innerText =
      extractedCompanyNameData;
    console.log(customButtonModel);

    //Company Logo Src scaping function
    compProfilePictureButton = document.querySelector(
      ".pv-text-details__right-panel .evi-image"
    );
    datashowCompLogo = customButtonModel.querySelector(".datashowCompLogo");
    //User Comapny Logo scrape data
    const extractedComapnyPictureSrc = getFirstImageSrcText();
    const imgElements = document.getElementById("CompanyDisplay");

    customButtonModel.querySelector(".datashowCompLogo").innerText =
      extractedComapnyPictureSrc;
    console.log(customButtonModel);

    datashowCompLogo.innerText = extractedComapnyPictureSrc;

    if (imgElements) {
      imgElements.setAttribute("src", extractedComapnyPictureSrc);
    }

    // Extract email addresses by class name
    function getEmailData() {
      const contactSections = document.querySelectorAll(
        ".pv-contact-info__contact-type"
      );

      let email = "";

      contactSections.forEach((section) => {
        const header = section.querySelector(".pv-contact-info__header");

        if (header && header.textContent.trim().toLowerCase() === "email") {
          const emailElement = section.querySelector("a[href^='mailto:']");

          if (emailElement) {
            email = emailElement.textContent.trim();
            const emailAddress = emailElement.href.replace("mailto:", "");
            console.log(email);
            console.log(emailAddress);
          } else {
            console.log("Email element not found");
          }
        }
      });

      return email;
    }

    function getLinkedInProfileUrl() {
      const contactSections = document.querySelectorAll(
        ".pv-contact-info__contact-type"
      );

      let linkedInProfile = "";

      contactSections.forEach((section) => {
        const header = section.querySelector(".pv-contact-info__header");

        if (
          header &&
          header.textContent.trim().toLowerCase().includes("profile")
        ) {
          const profileLink = section.querySelector("a[href*='linkedin.com']");

          if (profileLink) {
            linkedInProfile = profileLink.href.trim();
            console.log(linkedInProfile);
          } else {
            console.log("LinkedIn profile link not found");
          }
        }
      });
      return linkedInProfile;
    }

    function getMobileNumber() {
      const contactSections = document.querySelectorAll(
        ".pv-contact-info__contact-type"
      );
      let mobileNumber = "";
      contactSections.forEach((section) => {
        const header = section.querySelector(".pv-contact-info__header");
        if (header && header.textContent.trim().toLowerCase() === "phone") {
          const mobileElement = section.querySelector(
            "span.t-14.t-black.t-normal"
          );
          if (mobileElement) {
            mobileNumber = mobileElement.textContent.trim();
            console.log("Mobile Number:", mobileNumber);
            return mobileNumber;
          } else {
            console.log("Mobile number element not found");
          }
        }
      });
      return mobileNumber;
    }
    // Call the function to extract the mobile number
    getMobileNumber();

    function getUserName() {
      const nameElement = document.querySelector(
        ".artdeco-modal__header h1#pv-contact-info"
      );
      if (nameElement) {
        const fullName = nameElement.textContent.trim();
        const nameParts = fullName.split(" ");

        if (nameParts.length >= 2) {
          const firstName = nameParts[0];
          const lastName = nameParts[nameParts.length - 1]; // Last part is the last name
          console.log("First Name:", firstName);
          console.log("Last Name:", lastName);
          return { firstName, lastName };
        }

        console.log("Invalid name format.");
        return null;
      }

      console.log("User Name not found.");
      return null;
    }

    // Call the function to get the user's name and surname
    getUserName();

    customButtonModel
      .querySelector("#scrapeAllData")
      .addEventListener("click", function () {
        // Get the Company Email data
        const extractedEmailData = getEmailData();
        console.log(extractedEmailData);
        // Display the extracted data in the table
        customButtonModel.querySelector(".datashowUserEmail").innerText =
          extractedEmailData;
        console.log(customButtonModel);

        // Get the getLinkedInProfileUrl  data
        const extractedgetProfileData = getLinkedInProfileUrl();
        console.log(extractedgetProfileData);
        // Display the extracted data in the table
        customButtonModel.querySelector(".datashowUserUrl").innerText =
          extractedgetProfileData;
        console.log(customButtonModel);

        // Get the getMobileNumber data
        const extractedgetMobileNumber = getMobileNumber();
        console.log(extractedgetMobileNumber);
        // Display the extracted data in the table
        customButtonModel.querySelector(".datashowUserMobileNum").innerText =
          extractedgetMobileNumber;
        console.log(customButtonModel);

        // Get the extracted user's first name and surname
        const extractedUserName = getUserName();

        // Display the extracted data in the table
        const firstNameElement = document.querySelector(
          ".datashowUserFirstName"
        );
        const lastNameElement = document.querySelector(".datashowUserLastName");

        console.log(firstNameElement, lastNameElement);
        if (extractedUserName) {
          firstNameElement.innerText = extractedUserName.firstName;
          lastNameElement.innerText = extractedUserName.lastName;
        } else {
          firstNameElement.innerText = "Not Found";
          lastNameElement.innerText = "Not Found";
        }
      });

    // Read API
    document.addEventListener("click", function (event) {
      if (event.target.matches("#scrapeReadData")) {
        console.log("Clicked Scrape Read Data");

        const userData = {
          email1:
            document.querySelector(".datashowUserEmail")?.innerText || null,
          name:
            document.querySelector(".datashowUserFirstName")?.innerText || null,
          surname:
            document.querySelector(".datashowUserLastName")?.innerText || null,
        };

        console.log("User Data:", userData);
        saveUserReadDataAPI(userData);
      }
    });

    async function saveUserReadDataAPI(userData) {
      try {
        const result = await new Promise((resolve, reject) => {
          chrome.storage.local.get(
            ["yourTokenKey", "orgTokenKey"],
            function (result) {
              if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
              }
              resolve(result);
            }
          );
        });

        const retrievedToken = result.yourTokenKey;
        const retrievedOrgToken = result.orgTokenKey;

        if (retrievedToken && retrievedOrgToken) {
          console.log("Token retrieved contact:", retrievedToken);
          console.log("Token retrieved contact:", retrievedOrgToken);

          const email = userData.email1 !== null ? userData.email1 : "''";
          const name = userData.name || "";
          const surname = userData.surname || "";

          const apiEndpoint = `https://cors-anywhere.herokuapp.com/https://mokapen.com/api/v1/read_contact_new/${retrievedOrgToken}/''/${email}/${name}/${surname}/`;

          console.log("API Endpoint:", apiEndpoint);

          const response = await fetch(apiEndpoint, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${retrievedToken}`,
            },
          });

          const responseData = await response.json();
          console.log("Success contact:", responseData);

          const yourContactId = responseData.data?.contact_id;

          if (yourContactId) {
            const tokenObject = { yourContactId: yourContactId };

            await new Promise((resolve, reject) => {
              chrome.storage.local.set(tokenObject, function () {
                if (chrome.runtime.lastError) {
                  return reject(chrome.runtime.lastError);
                }
                console.log("Contact ID is saved", tokenObject);
                resolve();
              });
            });

            updateUIBasedOnResponse(responseData);
          } else {
            console.error("No contact ID in response");
            showStoreButton();
          }
        } else {
          console.error("Tokens are missing");
          showStoreButton();
        }
      } catch (error) {
        console.error("Error:", error);
        showStoreButton();
      }
    }

    function updateUIBasedOnResponse(responseData) {
      const updateButton = document.querySelector(".updateButton");
      const storeButton = document.querySelector(".storeButton");

      if (responseData && responseData.success) {
        updateButton.style.display = "block";
        storeButton.style.display = "none";
      } else {
        updateButton.style.display = "none";
        storeButton.style.display = "block";
      }

      // Update user information in the DOM
      document.querySelector(".datashowUsertype").innerText =
        responseData.data.type || "";
      document.querySelector(".datashowUsertypetwo").innerText =
        responseData.data.type2 || "";
      document.querySelector(".datashowUserjobrole").innerText =
        responseData.data.job_role || "";
      document.querySelector(".datashowUserphone").innerText =
        responseData.data.phone1 || "";
      document.querySelector(".datashowUseraddress").innerText =
        responseData.data.address1 || "";
      document.querySelector(".datashowUsercompany").innerText =
        responseData.data.company || "";
      document.querySelector(".datashowUserfname").innerText =
        responseData.data.name || "";
      document.querySelector(".datashowUserlname").innerText =
        responseData.data.surname || "";

      let description = responseData.data.discription || "";
      let tempElement = document.createElement("div");
      tempElement.innerHTML = description;
      let descriptionInnerText = tempElement.innerText;
      document.querySelector(".datashowUserdescription").innerText =
        descriptionInnerText || "";

      let privacyValue = responseData.data.privacy || 0;
      let statusText = document.querySelector(".statusText");
      document.getElementById("privacyToggle").checked = privacyValue === 1;
      statusText.innerText = privacyValue === 1 ? "Private" : "Public";
      document
        .getElementById("privacyToggle")
        .addEventListener("change", function () {
          statusText.innerText = this.checked ? "Private" : "Public";
          document.querySelector(".datashowUserprivacy").innerText =
            statusText.innerText;
        });

      // Process tagsArray
      var tagsArray = responseData.data.tags_array || [];
      for (var i = 0; i < tagsArray.length; i++) {
        var tag = tagsArray[i];
        var tagId = tag.id;
        if (!storedexistingTags.includes(tagId)) {
          storedexistingTags.push(tagId);
          var tagContainer = document.getElementById("tagContainer");
          var tagElement = document.createElement("div");
          var tagName = tag.tag.replace(/\s+/g, "_");
          tagElement.classList.add(tagName);
          tagElement.innerText = tagName;

          var inputElement = document.createElement("input");
          inputElement.setAttribute("type", "text");
          inputElement.setAttribute("name", "tag[]");
          inputElement.setAttribute("value", tag.id);

          inputElement.style.display = "none";
          tagElement.appendChild(inputElement);

          // Apply additional styles to tagElement
          tagElement.style.borderRadius = "10px"; // Set border radius to 10px
          tagElement.style.paddingLeft = "10px"; // Add padding to the left
          tagElement.style.paddingRight = "10px"; // Add padding to the right

          // Alternatively, you can use the shorthand padding property
          tagElement.style.padding = "0px 10px"; // Add padding to all sides (top, right, bottom, left)

          var closeIcon = document.createElement("i");
          closeIcon.classList.add("close-icon");
          closeIcon.innerText = "×";
          tagElement.appendChild(closeIcon);
          tagContainer.appendChild(tagElement);

          closeIcon.style.paddingLeft = "5px";
          closeIcon.style.cursor = "pointer";

          closeIcon.addEventListener(
            "click",
            createCloseIconEventListener(tagId)
          );

          var style = document.createElement("style");
          style.type = "text/css";
          var cssRule =
            "." +
            tagName +
            " { background-color: " +
            tag.background +
            "; color: " +
            tag.color +
            "; stroke: " +
            tag.stroke +
            "; }";
          style.appendChild(document.createTextNode(cssRule));
          document.head.appendChild(style);
        }
      }
    }

    function showStoreButton() {
      const updateButton = document.querySelector(".updateButton");
      const storeButton = document.querySelector(".storeButton");
      updateButton.style.display = "none";
      storeButton.style.display = "block";
    }

    // Function to create event listener for close icon with tagId captured in closure
    function createCloseIconEventListener(tagId) {
      return function () {
        var parentTagElement = this.parentNode;
        if (parentTagElement) {
          parentTagElement.remove();

          // Check if style element exists before trying to remove it
          var tagClassName = parentTagElement.classList[0];
          var styleToRemove = document.head.querySelector(
            "style." + tagClassName
          );
          if (styleToRemove) {
            styleToRemove.remove();
          } else {
            console.warn("Style element not found for tag:", tagClassName);
          }

          // Remove the tag ID from storedexistingTags
          storedexistingTags = storedexistingTags.filter((id) => id !== tagId);
        } else {
          console.error("Parent tag element not found");
        }
      };
    }

    document
      .getElementById("tagInput")
      .addEventListener("click", function (event) {
        var dropdown = document.getElementById("tagDropdown");
        if (dropdown.style.display === "block") {
          dropdown.style.display = "none";
        } else {
          dropdown.style.display = "block";
        }
        event.stopPropagation(); // Prevent the window click event from firing immediately
      });

    window.onclick = function (event) {
      if (!event.target.matches(".dropdown")) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.style.display === "block") {
            openDropdown.style.display = "none";
          }
        }
      }
    };

    //Tag List API

    let selectedTags = [];

    document
      .getElementById("tagInput")
      .addEventListener("click", function (event) {
        event.stopPropagation();

        chrome.storage.local.get(
          ["yourTokenKey", "orgTokenKey"],
          function (result) {
            const retrievedToken = result.yourTokenKey;
            const retrievedOrgToken = result.orgTokenKey;

            try {
              if (!retrievedToken) {
                throw new Error("Token not available.");
              }

              console.log("Token retrieved contact:", retrievedToken);

              fetch(
                `https://cors-anywhere.herokuapp.com/https://mokapen.com/api/v1/get_tags_list/${retrievedOrgToken}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + retrievedToken,
                  },
                }
              )
                .then((response) => {
                  if (!response.ok) {
                    throw new Error("Network response was not ok");
                  }
                  return response.json();
                })
                .then((apiResponse) => {
                  console.log("Tag API Response:", apiResponse); // Log API response for debugging

                  const data = apiResponse.data; // Access the array of tag objects

                  const tagContainer = document.getElementById("tagDropdown");
                  tagContainer.innerHTML = ""; // Clear existing content

                  data.forEach((tag) => {
                    const tagElement = document.createElement("div");
                    tagElement.classList.add("tag");
                    tagElement.textContent = tag.tag;

                    // Apply color and background styles from API response
                    tagElement.style.color = tag.color;
                    tagElement.style.backgroundColor = tag.background;

                    tagElement.addEventListener("click", () => {
                      console.log(
                        "Selected Tag:",
                        tag.tag,
                        tag.color,
                        tag.background
                      );

                      // Create an object with tag details
                      const selectedTag = {
                        id: tag.id,
                        tag: tag.tag,
                        color: tag.color,
                        background: tag.background,
                      };

                      // Add the selected tag to the array
                      selectedTags.push(selectedTag);

                      // Update the input value with the selected tag
                      document.getElementById("tagInput").value = tag.tag;

                      // Clear the tag container after selection
                      tagContainer.innerHTML = "";

                      const selectedTagDisplay = document.createElement("div");
                      selectedTagDisplay.textContent = tag.tag;
                      selectedTagDisplay.style.color = tag.color;
                      selectedTagDisplay.style.backgroundColor = tag.background;
                      selectedTagDisplay.style.borderRadius = "10px"; // Set border radius to 10px
                      selectedTagDisplay.style.padding = "0px 10px"; // Add padding to left and right only

                      // Create the input element
                      var inputElement = document.createElement("input");
                      inputElement.setAttribute("type", "text");
                      inputElement.setAttribute("name", "tag[]");
                      inputElement.setAttribute("value", tag.id);
                      inputElement.style.display = "none"; // Hide the input element
                      // Add the input element before the close icon div
                      selectedTagDisplay.appendChild(inputElement);

                      // Add a closing icon to the selected tag display
                      const closeIconSelected = document.createElement("i");
                      closeIconSelected.classList.add("close-icon");
                      closeIconSelected.textContent = "×";
                      selectedTagDisplay.appendChild(closeIconSelected);

                      closeIconSelected.style.paddingLeft = "5px";
                      closeIconSelected.style.cursor = "pointer";

                      // Add event listener to the closing icon for tag removal
                      closeIconSelected.addEventListener("click", () => {
                        // Remove the selected tag display from the container
                        selectedTagDisplay.remove();
                        // Remove the tag from the selectedTags array based on some condition
                        // For example, you can filter the selectedTags array based on the tag ID or name
                        selectedTags = selectedTags.filter(
                          (selectedTag) => selectedTag.tag !== tag.tag
                        );

                        console.log(
                          "Input fields Selected Tags after removal:",
                          selectedTags
                        );
                      });

                      const tagDisplayContainer =
                        document.getElementById("tagContainer");
                      tagDisplayContainer.appendChild(selectedTagDisplay);

                      console.log(
                        " Input fields Selected Tags before saving:",
                        selectedTags
                      );
                      console.log(
                        " Input fields storedexistingTags:",
                        storedexistingTags
                      );

                      let commaSeparatedTags = "";
                      const selectedTagIds = selectedTags.map((tag) => tag.id);

                      // Check if commaSeparatedTags already has a value
                      if (commaSeparatedTags) {
                        commaSeparatedTags += ","; // Add a comma if there's an existing value
                      }

                      commaSeparatedTags += selectedTagIds;
                    });

                    tagContainer.appendChild(tagElement);
                  });
                })
                .catch((error) => {
                  console.error("Error:", error);
                  // Handle errors - maybe show an error message to the user
                  alert(
                    "An error occurred while fetching tag data. Please try again later."
                  );
                });
            } catch (error) {
              console.error("An unexpected error occurred:", error);
              // Handle unexpected errors - show an error message to the user
              alert("An unexpected error occurred. Please try again later.");
            }
          }
        );
      });

    // JavaScript to add tags
    const tagInput = document.getElementById("tagInput");
    const addTagButton = document.getElementById("addTagButton");
    const tagContainer = document.getElementById("tagContainer");
    addTagButton.addEventListener("click", function () {
      const tagText = tagInput.value.trim();
      if (tagText) {
        const tag = document.createElement("div");
        tag.classList.add("tag");
        tag.textContent = tagText;
        tagContainer.appendChild(tag);
        tagInput.value = "";
      }
    });

    // Stored API

    document.addEventListener("click", function (event) {
      console.log(
        "Stored clicked also existing tag array:",
        storedexistingTags
      );

      const selectedTagIdsData = selectedTags.map((tag) => tag.id);
      console.log(
        "Stored clicked also add new tag list array:",
        selectedTagIdsData
      );

      console.log("Stored clicked");
      if (event.target.matches("#scrapeDataStore")) {
        console.log("Clicked Scrape Stored Data");

        // Extract privacy text and determine privacyValue
        const privacyText = document.querySelector(
          ".datashowUserprivacy"
        ).innerText;
        const privacyValue = privacyText.toLowerCase() === "public" ? 1 : 0;

        var existingTag = [];

        // Select all elements with class "tag-container"
        var tagContainers = document.querySelectorAll(".tag-container");

        // Iterate over each tag container
        tagContainers.forEach(function (tagContainer) {
          // Select all input elements within the current tag container
          var inputs = tagContainer.querySelectorAll(
            'input[type="text"][name="tag[]"]'
          );

          // Iterate over each input element
          inputs.forEach(function (input) {
            var name = input.getAttribute("name"); // Get the name attribute
            var value = input.getAttribute("value"); // Get the value attribute

            existingTag.push(Number(value));
          });
        });
        // Gather user data from different elements on the page
        const userData = {
          job_role: document.querySelector(".datashowDesignation").innerText,
          photo: document.querySelector(".datashowUserProLogo").innerText,
          company_id: document.querySelector(".datashowCompName").innerText,
          logo: document.querySelector(".datashowCompLogo").innerText,
          name: document.querySelector(".datashowUserFirstName").innerText,
          surname: document.querySelector(".datashowUserLastName").innerText,
          email1: document.querySelector(".datashowUserEmail").innerText,
          phone1: document.querySelector(".datashowUserMobileNum").innerText,
          linkedin: document.querySelector(".datashowUserUrl").innerText,
          address1: document.querySelector(".datashowUseraddress").innerText,
          privacy: privacyValue,
          tag: existingTag, // Use combined tagIds array here
        };

        console.log("UserData:", userData); // Log userData for debugging

        // Call the storeUserDataToAPI function with userData as an argument
        storeUserDataToAPI(userData);
      }
    });

    function storeUserDataToAPI(userData) {
      chrome.storage.local.get(
        ["yourTokenKey", "orgTokenKey"],
        function (result) {
          const retrievedToken = result.yourTokenKey;
          const retrievedOrgToken = result.orgTokenKey;

          if (retrievedToken) {
            const apiEndpoint =
              "https://cors-anywhere.herokuapp.com/https://mokapen.com/api/v1/store_contact/" +
              retrievedOrgToken +
              "";

            fetch(apiEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + retrievedToken,
              },
              body: JSON.stringify(userData),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Network response was not ok");
                }
                return response.json();
              })
              .then((data) => {
                console.log("Success:", data);
                // Handle success - maybe close the model or show a success message
              })
              .catch((error) => {
                console.error("Error:", error);
                // Handle errors - maybe show an error message to the user
              });
          }
        }
      );
    }

    // Update API
    
    document.addEventListener("click", function (event) {
      console.log("update clicked");
      if (event.target.matches("#scrapeDataUpdate")) {
        console.log("Clicked Scrape Read Data");

        // Extract privacy text and determine privacyValue
        const privacyText = document.querySelector(
          ".datashowUserprivacy"
        ).innerText;

        console.log("privacy data store to database", privacyText);

        const privacyValue = privacyText.toLowerCase() === "public" ? 1 : 0;

        console.log("privacy data store to database", privacyValue);

        // Extract tags similar to the store function
        var existingTag = [];

        // Select all elements with class "tag-container"
        var tagContainers = document.querySelectorAll(".tag-container");

        // Iterate over each tag container
        tagContainers.forEach(function (tagContainer) {
          // Select all input elements within the current tag container
          var inputs = tagContainer.querySelectorAll(
            'input[type="text"][name="tag[]"]'
          );

          // Iterate over each input element
          inputs.forEach(function (input) {
            var name = input.getAttribute("name"); // Get the name attribute
            var value = input.getAttribute("value"); // Get the value attribute

            existingTag.push(Number(value));
          });
        });

        // Gather user data from different elements on the page
        const userData = {
          job_role: document.querySelector(".datashowDesignation").innerText,
          photo: document.querySelector(".datashowUserProLogo").innerText,
          company_id: document.querySelector(".datashowCompName").innerText,
          logo: document.querySelector(".datashowCompLogo").innerText,
          name: document.querySelector(".datashowUserFirstName").innerText,
          surname: document.querySelector(".datashowUserLastName").innerText,
          email1: document.querySelector(".datashowUserEmail").innerText,
          phone1: document.querySelector(".datashowUserMobileNum").innerText,
          linkedin: document.querySelector(".datashowUserUrl").innerText,
          address1: document.querySelector(".datashowUseraddress").innerText,
          privacy: privacyValue,
          tag: existingTag, // Include extracted tag data
        };

        console.log("UserData:", userData); // Log userData for debugging

        // Call the updateUserDataToAPI function with userData as an argument
        updateUserDataToAPI(userData);
      }
    });

    function updateUserDataToAPI(userData) {
      chrome.storage.local.get(
        ["yourTokenKey", "yourContactId", "orgTokenKey"],
        function (result) {
          const retrievedToken = result.yourTokenKey;
          const retrievedContactid = result.yourContactId;
          const retrievedOrgToken = result.orgTokenKey;

          if (retrievedToken && retrievedContactid) {
            const apiEndpoint = `https://cors-anywhere.herokuapp.com/https://mokapen.com/api/v1/update_contact_new/${retrievedOrgToken}/${retrievedContactid}`;

            fetch(apiEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + retrievedToken,
              },
              body: JSON.stringify(userData),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Network response was not ok");
                }
                return response.json();
              })
              .then((data) => {
                console.log("API Response:", data); // Log API response for debugging
                console.log("Success:", data);
                // Handle success - maybe close the model or show a success message
              })
              .catch((error) => {
                console.error("Error:", error);
                // Handle errors - maybe show an error message to the user
              });
          } else {
            console.error("Token or Contact ID not available.");
            // Handle the case where token or contact ID is missing
          }
        }
      );
    }
  }
} //loadCustomHTMLContent end of this function

// Observe the DOM and append the button when the target element is available
const observer = new MutationObserver((mutations) => {
  appendButtonWhenReady();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial call in case the element is already present
appendButtonWhenReady();
