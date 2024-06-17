let scrapeAllData = document.getElementById("scrapeAllData");
const datashow = document.querySelector(".datashowDesignation");
const datashowCompany = document.querySelector(".datashowCompName");
const datashowProLogo = document.querySelector(".datashowUserProLogo");
const datashowCompLogo = document.querySelector(".datashowCompLogo");
const datashowEmail = document.querySelector(".datashowUserEmail");
const datashowFirst = document.querySelector(".datashowUserFirstName");
const datashowLast = document.querySelector(".datashowUserLastName");
const datashowMobileNum = document.querySelector(".datashowUserMobileNum");
const datashowUserUrl = document.querySelector(".datashowUserUrl");
const datashow1 = document.querySelector(".datashow");
const datashowdomain = document.querySelector(".datashowdomain");

const positionToStoreComName = 0;
const positionToStoreComapnyLogo = 0;
const positionToStoreMobile = 0;
const positionlinkedInProfileurlToStoreMobile = 0;

scrapeAllData.addEventListener("click", async () => {
  let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length > 0) {
    let tab = tabs[0];

    // Check if the tab's URL is valid for content scripts
    if (
      tab.url &&
      (tab.url.startsWith("http") || tab.url.startsWith("https"))
    ) {
      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeDataProfileDesignationFromPage,
      });

      const injectionCompanyResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeDataProfileCompNameFromPage,
      });

      const injectionLogoProfile = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeDataProfileUserLogoFromPage,
      });

      const injectionCompLogo = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeDataProfileCompLogoFromPage,
      });

      const injectionEmail = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeDataContactEmailInfoFromPage,
      });

      const injectionFullNameInfo = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeDataContactFullNameInfoFromPage,
      });

      const injectionMobileNum = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeDataContactMobileNumInfoFromPage,
      });

      const injectionUserUrl = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeDataContactProfileUrlInfoFromPage,
      });

      const injectionResults1 = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeDataCompanyInfoFromPage,
      });

      const injectiondomain = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeDataCompanyDomainInfoFromPage,
      });

      // Check if the script executed successfully and returned data
      if (
        injectionResults &&
        injectionResults[0] &&
        injectionResults[0].result
      ) {
        const firstInnerText = injectionResults[0].result.firstInnerText; // Declare firstInnerText
        console.log("Company Desingnation data:", firstInnerText);
        datashow.textContent = " " + firstInnerText;

        // You can do something with designationToStore, e.g., add it to alertMessage or display it
      }

      // Check if the script executed successfully and returned data
      if (
        injectionCompanyResults &&
        injectionCompanyResults[0] &&
        injectionCompanyResults[0].result
      ) {
        const CompanyName = injectionCompanyResults[0].result.CompanyName; // Declare CompanyName

        // Check if the array is long enough to access the 3rd index
        if (CompanyName.length > positionToStoreComName) {
          const companyToStore = CompanyName[positionToStoreComName];
          // Display the 3rd index value in the HTML element with the class "datashowDesignation"
          datashowCompany.textContent = " " + companyToStore;
          // You can do something with designationToStore, e.g., add it to alertMessage or display it
        } else {
          // Handle the case when the array is not long enough
          // e.g., alertMessage += 'Designation Name:\n No designation found at index 3.\n';
        }

        //   datashow.textContent = " " + CompanyName.join("\n");

        // Check if the script executed successfully and returned data
        if (
          injectionLogoProfile &&
          injectionLogoProfile[0] &&
          injectionLogoProfile[0].result
        ) {
          const imageUrls = injectionLogoProfile[0].result.imageUrls;

          // Now you can use the data from the injected script
          console.log("Company Profile URLs:", imageUrls);
          datashowProLogo.textContent = " " + imageUrls;
          UserDisplay.src = imageUrls;
          // You can do further processing with the data here
        }

        // Check if the script executed successfully and returned data
        if (
          injectionCompLogo &&
          injectionCompLogo[0] &&
          injectionCompLogo[0].result
        ) {
          const Companylogo = injectionCompLogo[0].result.Companylogo; // Declare Companylogo

          // Check if the array is long enough to access the 3rd index
          if (Companylogo.length > positionToStoreComapnyLogo) {
            const CompanylogoToStore = Companylogo[positionToStoreComapnyLogo];
            // Display the 3rd index value in the HTML element with the class "datashowDesignation"
            datashowCompLogo.textContent = " " + CompanylogoToStore;
            imageDisplay.src = CompanylogoToStore;
            // You can do something with designationToStore, e.g., add it to alertMessage or display it
          } else {
            // Handle the case when the array is not long enough
            // e.g., alertMessage += 'Designation Name:\n No designation found at index 3.\n';
          }

          //   datashow.textContent = " " + Companylogo.join("\n");
        }

        // Check if the script executed successfully and returned data
        if (injectionEmail && injectionEmail[0] && injectionEmail[0].result) {
          const emailAddress = injectionEmail[0].result.emailAddress;

          // Now you can use the data from the injected script
          console.log("Company Profile URLs:", emailAddress);
          datashowEmail.textContent = " " + emailAddress;

          // You can do further processing with the data here
        }

        if (
          injectionFullNameInfo &&
          injectionFullNameInfo[0] &&
          injectionFullNameInfo[0].result
        ) {
          const names = injectionFullNameInfo[0].result.names;
          // Check if the script executed successfully and returned data
          if (names.length > 0) {
            // Get the first and last name from the first element in the array
            const firstName = names[0].firstName;
            const lastName = names[0].surname;

            // Display the first and last name separately
            datashowFirst.textContent = firstName;
            datashowLast.textContent = lastName;
          }
        }

        // Check if the script executed successfully and returned data
        if (
          injectionMobileNum &&
          injectionMobileNum[0] &&
          injectionMobileNum[0].result
        ) {
          const mobileNumbers = injectionMobileNum[0].result.mobileNumbers;

          // Now you can use the data from the injected script
          console.log("Company Profile URLs:", mobileNumbers);
          datashowMobileNum.textContent = " " + mobileNumbers;

          // You can do further processing with the data here
        }

        // Check if the script executed successfully and returned data
        if (
          injectionUserUrl &&
          injectionUserUrl[0] &&
          injectionUserUrl[0].result
        ) {
          const linkedInProfileurl =
            injectionUserUrl[0].result.linkedInProfileurl;

          // Now you can use the data from the injected script
          console.log("Company Profile URLs:", linkedInProfileurl);
          datashowUserUrl.textContent = " " + linkedInProfileurl;

          // You can do further processing with the data here
        }

        // Check if the script executed successfully and returned data
        if (
          injectionResults1 &&
          injectionResults1[0] &&
          injectionResults1[0].result
        ) {
          const companyProfileUrls =
            injectionResults1[0].result.companyProfileUrls;

          // Now you can use the data from the injected script
          console.log("Company Profile URLs:", companyProfileUrls);
          datashow1.textContent = " " + companyProfileUrls.join("\n");

          // You can do further processing with the data here
        }

        // Check if the script executed successfully and returned data
        if (
          injectiondomain &&
          injectiondomain[0] &&
          injectiondomain[0].result
        ) {
          const CompanyDomainUrls = injectiondomain[0].result.CompanyDomainUrls;

          // Now you can use the data from the injected script
          console.log("Company Profile URLs:", CompanyDomainUrls);
          datashowdomain.textContent = " " + CompanyDomainUrls.join("\n");

          // You can do further processing with the data here
        }
      }
    } else {
      alert("This page is not accessible for scraping emails.");
    }
  }
});

export function scrapeDataProfileFromPage() {
  let alertMessage = "";
  const imageUrls = [];
  const designationData = [];
  const CompanyName = [];
  const Companylogo = [];

  const emailAddress = [];
  const mobileNumbers = [];
  const names = [];
  const linkedInProfileurl = [];

  // Extract Image address by class name
  const profileImage = document.body.querySelectorAll(
    ".pv-top-card-profile-picture__image"
  );
  profileImage.forEach((element) => {
    const src = element.getAttribute("src");
    if (src) {
      imageUrls.push(src);
      // console.log(src);
    }
  });

  // Extract designation  by class name
  const designation = document.body.querySelectorAll(
    ".pv-text-details__left-panel div"
  );
  designation.forEach((element) => {
    designationData.push(element.textContent.trim());
    // console.log(designationData);
  });

  // Extract CompanyName  by class name
  const company = document.body.querySelectorAll(
    ".pv-text-details__right-panel-item-text"
  );
  company.forEach((element) => {
    CompanyName.push(element.textContent.trim());
    //  console.log(CompanyName);
  });

  // Extract Company Logo  by class name
  const Companylogourl = document.body.querySelectorAll(
    ".pv-text-details__right-panel-item img"
  );
  console.log(Companylogourl);
  Companylogourl.forEach((element) => {
    const src = element.getAttribute("src");
    console.log(src);
    if (src) {
      Companylogo.push(src);
      console.log(src);
    }
  });

  // Extract email addresses by class name
  const email = document.body.querySelectorAll(
    ".pv-contact-info__contact-type.ci-email .pv-contact-info__contact-link"
  );
  email.forEach((element) => {
    emailAddress.push(element.textContent.trim());
    console.log(emailAddress);
  });

  // Extract mobile numbers by class name
  const mobile = document.body.querySelectorAll(
    ".pv-contact-info__contact-type.ci-phone .t-14.t-black.t-normal"
  );
  mobile.forEach((element) => {
    mobileNumbers.push(element.textContent.trim());
    console.log(mobileNumbers);
  });

  // Extract nameElements user by class name
  const nameElements = document.body.querySelectorAll("#pv-contact-info");
  nameElements.forEach((element) => {
    const fullName = element.textContent.trim();
    const nameParts = fullName.split(" "); // Split by space
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const surname = nameParts[nameParts.length - 1]; // Last part is the last name
      names.push({ firstName, surname });
      console.log(names);
    }
  });

  // Extract email addresses by class name
  const linkedInProfileUrlData = document.body.querySelectorAll(
    ".pv-contact-info__contact-link.link-without-visited-state.t-14"
  );
  linkedInProfileUrlData.forEach((element) => {
    linkedInProfileurl.push(element.textContent.trim());
    console.log(linkedInProfileurl);
  });

  // declaration Data

  // Extract imageUrls
  if (imageUrls.length > 0) {
    alertMessage += "Image Url:\n" + imageUrls.join("\n") + "\n";
  } else {
    alertMessage += "Image Url:\n No Image Url found on this page.\n";
  }

  // Extract designationData
  if (designationData.length > positionToStoreDesignation) {
    const designationToStore = designationData[positionToStoreDesignation];
    console.log(designationToStore);
    alertMessage += "Desingation Name:\n" + designationToStore + "\n";
  } else {
    alertMessage += "Desingation Name:\n No designation found on this page.\n";
  }

  // Extract CompanyName
  if (CompanyName.length > positionToStoreComapny) {
    const companyToStore = CompanyName[positionToStoreComapny];
    alertMessage += "Company Name:\n" + companyToStore + "\n";
  } else {
    alertMessage += "Company Name:\n No company found on this page.\n";
  }

  // Extract imageUrls
  if (Companylogo.length > positionToStoreComapnyLogo) {
    const CompanylogoToStore = Companylogo[positionToStoreComapnyLogo];
    console.log(CompanylogoToStore);
    alertMessage += "Company Logo Url:\n" + CompanylogoToStore + "\n";
  } else {
    alertMessage += "Company Logo Url:\n No designation found on this page.\n";
  }

  // Extract EmailAddresses and Surname by class name
  if (emailAddress.length > 0) {
    alertMessage += "Email Address:\n" + emailAddress.join("\n") + "\n";
  } else {
    alertMessage += "No Email found on this page.\n";
  }

  // Extract mobileNumbers by class name
  if (mobileNumbers.length > positionToStoreMobile) {
    const mobileNumbersToStore = mobileNumbers[positionToStoreMobile];
    alertMessage += "Mobile Numbers:\n" + mobileNumbersToStore + "\n";
  } else {
    alertMessage += "No mobile numbers found on this page.";
  }

  // Extract firstName and Surname by class name
  if (names.length > 0) {
    alertMessage += "Names:\n";
    names.forEach((name) => {
      alertMessage += `First Name: ${name.firstName}, Last Name: ${name.surname}\n`;
    });
  } else {
    alertMessage += "No names found on this page.\n";
  }

  // Extract EmailAddresses and Surname by class name
  if (linkedInProfileurl.length > positionlinkedInProfileurlToStoreMobile) {
    const linkedInProfileurlToStore =
      linkedInProfileurl[positionlinkedInProfileurlToStoreMobile];
    alertMessage += "linkedInProfileurl:\n" + linkedInProfileurlToStore;
  } else {
    alertMessage += "No linkedInProfileurl found on this page.";
  }

  // alert(alertMessage);
}
function scrapeDataProfileDesignationFromPage() {
  const designationData = [];
  let firstInnerText = null; // Initialize firstInnerText to null

  // Use an XPath expression to select the desired div elements
  const xpathExpression = '//div[contains(@class, "text-body-medium")]';
  const designationDivs = document.evaluate(
    xpathExpression,
    document,
    null,
    XPathResult.ANY_TYPE,
    null
  );

  let divNode = designationDivs.iterateNext();
  while (divNode) {
    // Extract and push the inner text of each matching div
    const innerText = divNode.textContent.trim();
    designationData.push(innerText);

    // Store the inner text of the first matching div if it hasn't been stored already
    if (firstInnerText === null) {
      firstInnerText = innerText;
    }

    divNode = designationDivs.iterateNext();
  }

  // Log the firstInnerText outside the loop
  console.log(firstInnerText);
  // console.log("All Inner Texts:", designationData);

  return { firstInnerText: firstInnerText };
}

// Export the function outside of the event listener
function scrapeDataProfileCompNameFromPage() {
  const CompanyName = [];

  // Extract designation by class name
  const company = document.body.querySelectorAll(
    ".pv-text-details__right-panel-item-text"
  );
  company.forEach((element) => {
    CompanyName.push(element.textContent.trim());
    console.log(CompanyName);
  });

  return { CompanyName: CompanyName };
}

function scrapeDataProfileUserLogoFromPage() {
  const imageUrls = [];

  const profileImage = document.body.querySelectorAll(
    ".pv-top-card-profile-picture__image"
  );
  profileImage.forEach((element) => {
    const src = element.getAttribute("src");
    if (src) {
      imageUrls.push(src);
      console.log(src);
    }
  });

  return { imageUrls: imageUrls };
}

function scrapeDataProfileCompLogoFromPage() {
  const Companylogo = [];

  // Use XPath to select the img elements
  const Companylogourl1 = document.evaluate(
    "(//ul[contains(@class, 'pv-text-details__right-panel')]//li[1]//img)",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  const Companylogourl2 = document.evaluate(
    "(//ul[contains(@class, 'pv-text-details__right-panel')]//li[2]//img)",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  // Extract the src attribute
  if (Companylogourl1) {
    const src1 = Companylogourl1.getAttribute("src");
    if (src1) {
      Companylogo.push(src1);
      console.log(src1);
    }
  }

  if (Companylogourl2) {
    const src2 = Companylogourl2.getAttribute("src");
    if (src2) {
      Companylogo.push(src2);
      console.log(src2);
    }
  }

  return { Companylogo: Companylogo };
}

function scrapeDataContactEmailInfoFromPage() {
  const emailAddress = [];

  const emailLinks = document.querySelectorAll(
    '.pv-contact-info__ci-container a[href^="mailto:"]'
  );

  emailLinks.forEach((element) => {
    emailAddress.push(element.textContent.trim());
    console.log(emailAddress);
  });

  return { emailAddress: emailAddress };
}

function scrapeDataContactFullNameInfoFromPage() {
  const names = [];

  const nameElements = document.body.querySelectorAll("#pv-contact-info");
  nameElements.forEach((element) => {
    const fullName = element.textContent.trim();
    const nameParts = fullName.split(" "); // Split by space
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const surname = nameParts[nameParts.length - 1]; // Last part is the last name
      names.push({ firstName, surname });
      console.log(names);
    }
  });

  return { names: names };
}

function scrapeDataContactMobileNumInfoFromPage() {
  const mobileNumbers = [];

  // Use document.evaluate to find the mobile number element
  const mobileNumberElement = document.evaluate(
    "//li[contains(@class, 'pv-contact-info__ci-container') and contains(., '(Mobile)')]/span[@class='t-14 t-black t-normal']",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (mobileNumberElement) {
    // Get the text content of the mobile number element
    const mobileNumber = mobileNumberElement.textContent.trim();
    mobileNumbers.push(mobileNumber);
    console.log(mobileNumbers);
  }

  return { mobileNumbers: mobileNumbers };
}

function scrapeDataContactProfileUrlInfoFromPage() {
  const linkedInProfileurl = [];

  // Extract email addresses by class name
  const linkedInProfileUrlData = document.body.querySelectorAll(
    ".pv-contact-info__contact-link.link-without-visited-state.t-14"
  );
  linkedInProfileUrlData.forEach((element) => {
    linkedInProfileurl.push(element.textContent.trim());
    console.log(linkedInProfileurl);
  });

  return { linkedInProfileurl: linkedInProfileurl };
}

function scrapeDataCompanyInfoFromPage() {
  const CompanyProfileUrls = [];
  const container = document.querySelectorAll(".org-page-navigation");
  const links = container[0].querySelectorAll("a");

  links.forEach((link) => {
    if (link.textContent.trim() === "Jobs") {
      const url = link.getAttribute("href");
      const modifiedUrl = "https://www.linkedin.com" + url.replace("jobs/", "");
      CompanyProfileUrls.push(modifiedUrl);
    }
  });

  return { companyProfileUrls: CompanyProfileUrls };
}

function scrapeDataCompanyDomainInfoFromPage() {
  try {
    const CompanyDomainUrls = [];

    // Find the anchor element within the specified section by its class.
    const imageElements = document.querySelectorAll(
      ".artdeco-card.org-page-details-module__card-spacing.artdeco-card.org-about-module__margin-bottom"
    );

    if (imageElements.length > 0) {
      const anchorElements = imageElements[0].querySelectorAll(
        "a.link-without-visited-state"
      );

      if (anchorElements.length > 0) {
        anchorElements.forEach((anchorElement) => {
          const href = anchorElement.getAttribute("href");
          if (href) {
            CompanyDomainUrls.push(href);
            console.log(href);
          }
        });
      } else {
        console.error(
          "No anchor elements with class 'link-without-visited-state' found."
        );
      }
    } else {
      console.error(
        "No elements with class 'artdeco-card.org-page-details-module__card-spacing.artdeco-card.org-about-module__margin-bottom' found."
      );
    }

    return { CompanyDomainUrls: CompanyDomainUrls };
  } catch (error) {
    console.error("An error occurred while scraping data:", error);
    return { CompanyDomainUrls: [] };
  }
}
