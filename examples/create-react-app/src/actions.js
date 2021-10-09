export const setRandomNumber = (context) => {
    const number = Math.floor(Math.random() * Math.floor(100));
    context.dispatch('SET_NUMBER', { number });
};
