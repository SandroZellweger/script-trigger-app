function getAccountInfo() {
  const url = "https://mybusinessaccountmanagement.googleapis.com/v1/accounts";
  const token = "ya29.a0AW4XtxiNzr1_hSEHYJnwNznMNKN-ct3NcNJBoYkUmE8Jn6wHQ1PE5YHSlLzSMNu9x_IBua7U_l9dOAukdM4qh1LPXwmEyuHwG_yrrfyb-75EDe5YB6mp7lQUOOo-A8jFKE2TXgYzZ40in3iEYBxeR8UNlSm8TCLo-kIplNs-WgaCgYKAZsSARYSFQHGX2Mig47hGXQhJjx27Dh86XaItA0177";
  
  try {
    const response = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`
      },
      muteHttpExceptions: true
    });
    
    const content = response.getContentText();
    const statusCode = response.getResponseCode();
    
    Logger.log(`Status Code: ${statusCode}`);
    Logger.log(`Response: ${content}`);
    
    if (statusCode === 200) {
      const json = JSON.parse(content);
      Logger.log("Accounts: " + JSON.stringify(json, null, 2));
    } else {
      Logger.log(`Error: ${statusCode} - ${content}`);
    }
  } catch (e) {
    Logger.log(`Exception: ${e.message}`);
  }
}
function autoReplyToFiveStarReviews() {
  const token = "ya29.a0AW4XtxiNzr1_hSEHYJnwNznMNKN-ct3NcNJBoYkUmE8Jn6wHQ1PE5YHSlLzSMNu9x_IBua7U_l9dOAukdM4qh1LPXwmEyuHwG_yrrfyb-75EDe5YB6mp7lQUOOo-A8jFKE2TXgYzZ40in3iEYBxeR8UNlSm8TCLo-kIplNs-WgaCgYKAZsSARYSFQHGX2Mig47hGXQhJjx27Dh86XaItA0177";
  
  // Step 1: Get accounts
  const accounts = getAccounts(token);
  if (!accounts) {
    Logger.log("Failed to retrieve accounts.");
    return;
  }
  
  // Step 2: Process each account (focus on Noleggio Furgoni Ticino, a LOCATION_GROUP)
  const targetAccountId = "114220056691832644947"; // Noleggio Furgoni Ticino
  const locations = getLocations(token, targetAccountId);
  if (!locations) {
    Logger.log("Failed to retrieve locations for account: " + targetAccountId);
    return;
  }
  
  // Step 3: Process reviews for each location
  locations.forEach(location => {
    const locationId = location.name.split('/')[1]; // Extract locationId from "locations/{locationId}"
    const reviews = getReviews(token, targetAccountId, locationId);
    if (!reviews) {
      Logger.log("Failed to retrieve reviews for location: " + location.name);
      return;
    }
    
    // Step 4: Filter 5-star reviews and reply if not already replied
    reviews.forEach(review => {
      if (review.starRating === "FIVE" && !review.commentReply) {
        const reply = "Grazie per la tua recensione a 5 stelle! Siamo felici che tu abbia avuto un'esperienza positiva con Noleggio Furgoni Ticino. Torna presto!";
        postReviewReply(token, review.name, reply);
      }
    });
  });
}

function getAccounts(token) {
  const url = "https://mybusinessaccountmanagement.googleapis.com/v1/accounts";
  try {
    const response = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`
      },
      muteHttpExceptions: true
    });
    const statusCode = response.getResponseCode();
    const content = response.getContentText();
    Logger.log(`Get Accounts - Status Code: ${statusCode}`);
    Logger.log(`Get Accounts - Response: ${content}`);
    
    if (statusCode === 200) {
      const json = JSON.parse(content);
      return json.accounts;
    } else {
      Logger.log(`Get Accounts - Error: ${statusCode} - ${content}`);
      return null;
    }
  } catch (e) {
    Logger.log(`Get Accounts - Exception: ${e.message}`);
    return null;
  }
}

function getLocations(token, accountId) {
  const url = `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title`;
  try {
    const response = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`
      },
      muteHttpExceptions: true
    });
    const statusCode = response.getResponseCode();
    const content = response.getContentText();
    Logger.log(`Get Locations - Status Code: ${statusCode}`);
    Logger.log(`Get Locations - Response: ${content}`);
    
    if (statusCode === 200) {
      const json = JSON.parse(content);
      return json.locations || [];
    } else {
      Logger.log(`Get Locations - Error: ${statusCode} - ${content}`);
      return null;
    }
  } catch (e) {
    Logger.log(`Get Locations - Exception: ${e.message}`);
    return null;
  }
}

function getReviews(token, accountId, locationId) {
  const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`;
  try {
    const response = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`
      },
      muteHttpExceptions: true
    });
    const statusCode = response.getResponseCode();
    const content = response.getContentText();
    Logger.log(`Get Reviews - Status Code: ${statusCode}`);
    Logger.log(`Get Reviews - Response: ${content}`);
    
    if (statusCode === 200) {
      const json = JSON.parse(content);
      return json.reviews || [];
    } else {
      Logger.log(`Get Reviews - Error: ${statusCode} - ${content}`);
      return null;
    }
  } catch (e) {
    Logger.log(`Get Reviews - Exception: ${e.message}`);
    return null;
  }
}

function postReviewReply(token, reviewName, replyText) {
  const url = `https://mybusiness.googleapis.com/v4/${reviewName}/reply`;
  try {
    const response = UrlFetchApp.fetch(url, {
      method: "put",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      payload: JSON.stringify({ comment: replyText }),
      muteHttpExceptions: true
    });
    const statusCode = response.getResponseCode();
    const content = response.getContentText();
    Logger.log(`Post Review Reply - Status Code: ${statusCode}`);
    Logger.log(`Post Review Reply - Response: ${content}`);
    
    if (statusCode === 200) {
      Logger.log(`Successfully posted reply to review: ${reviewName}`);
    } else {
      Logger.log(`Post Review Reply - Error: ${statusCode} - ${content}`);
    }
  } catch (e) {
    Logger.log(`Post Review Reply - Exception: ${e.message}`);
  }
}