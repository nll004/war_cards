function getAngle() {
    // generate a random angle between 0-40 with pos or neg direction for cards
    const angle = Math.floor(Math.random() * 30);
    const direction = (Math.random() < 0.5) ? '-' : ''; // pos or neg angle

    return direction + angle
}

export default getAngle;
