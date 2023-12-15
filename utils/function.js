exports.extractNameFromEmail=(email)=> {
    const emailRegex = /^([^@]+)@([^@]+)\.([a-zA-Z]{2,})$/;
    const match = email.match(emailRegex);

    if (match && match.length === 4) {
        const [_, username, domain, tld] = match;
        const name = username.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
        return name;
    } else {
        return null;
    }
}