// main.js

// Import the scrapeDataFromPage function from the content.js file
import { scrapeDataProfileFromPage } from './linkedProfileData/linkedInProfiledashboard';

import { scrapeDataProfileAndContactInfo } from './dashboardalldata';


import { scrapeDataProfileDesignationFromPage } from './linkedInProfiledashboardDesignation';
import { scrapeDataProfileCompNameFromPage } from './linkedInProfiledashboardComName';
import { scrapeDataProfileCompLogoFromPage } from './linkedInProfiledashboardComLogo';
import { scrapeDataProfileUserLogoFromPage } from './linkedInProfiledashboardUserProfile';


import { scrapeDataContactInfoFromPage } from './linkedinContactInfo';
import { scrapeDataContactEmailInfoFromPage } from './linkedinContactInfoEmail';
import { scrapeDataContactFullNameInfoFromPage } from './linkedinContactInfoFullName';
import { scrapeDataContactMobileNumInfoFromPage } from './linkedinContactInfoMobileNum';
import { scrapeDataContactProfileUrlInfoFromPage } from './linkedinContactInfoProfileUrl';

//company Domain and Profile url
import { scrapeDataCompanyInfoFromPage } from './companyData/linkedinCompany';
import { scrapeDataCompanyDomainInfoFromPage } from './companyData/linkedinCompanyDomain';


const ProfileAndContactInfo = scrapeDataProfileAndContactInfo();

// Call the function to get the data
const dataprofile = scrapeDataProfileFromPage();
const dataprofileDesignation = scrapeDataProfileDesignationFromPage();
const dataprofileCompName = scrapeDataProfileCompNameFromPage();
const dataprofileCompLogo = scrapeDataProfileCompLogoFromPage();
const dataprofileUserLogo = scrapeDataProfileUserLogoFromPage();

const dataconatctinfo = scrapeDataContactInfoFromPage();
const dataconatctinfoEmail = scrapeDataContactEmailInfoFromPage();
const dataconatctinfoFullName = scrapeDataContactFullNameInfoFromPage();
const dataconatctinfoMobileNum = scrapeDataContactMobileNumInfoFromPage();
const dataconatctinfoProfileUrl = scrapeDataContactProfileUrlInfoFromPage();

//company Domain and Profile url
const datacompanyinfo = scrapeDataCompanyInfoFromPage();
const datacompanyDomaininfo = scrapeDataCompanyDomainInfoFromPage();

// You can now use the 'data' object in your main.js as needed
console.log(ProfileAndContactInfo.ProfileAndContactInfo);


console.log(dataprofile.profileImage);

console.log(dataprofile.designation);
console.log(dataprofileDesignation.designationToStore);
console.log(dataprofileCompName.CompNameToStore);
console.log(dataprofileCompLogo.CompanylogoToStore);
console.log(dataprofileUserLogo.UserProfileToStore);

console.log(dataprofile.company);
console.log(dataprofile.Companylogourl);


console.log(dataconatctinfo.email);
console.log(dataconatctinfo.mobile);
console.log(dataconatctinfo.nameElements);
console.log(dataconatctinfo.linkedInProfileUrlData);
console.log(dataconatctinfoEmail.linkedInProfileEmail);
console.log(dataconatctinfoFullName.linkedInProfileFullName);
console.log(dataconatctinfoMobileNum.linkedInProfileMobileNum);
console.log(dataconatctinfoProfileUrl.linkedInProfileProfileUrl);


//company Domain and Profile url
console.log(datacompanyinfo.CompanyLinkedInurl);
console.log(datacompanyDomaininfo.CompanyDomainUrls);

