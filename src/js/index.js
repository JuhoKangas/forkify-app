import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import {
    elements,
    renderLoader,
    clearLoader
} from './views/base';

/**
 * - Search obect
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */

const state = {};

/**
 * Search Controller
 */

const controlSearch = async () => {
    // 1. Get the query from the view
    const query = searchView.getInput();

    if (query) {
        // 2. New search object and add to state
        state.search = new Search(query);

        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4. Search for recipes
            await state.search.getResults();

            // 5. render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something went wrong with the search');
        }
    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


/**
 * Recipe Controller
 */
const controlRecipe = async () => {
    // Get the ID from URL
    const id = window.location.hash.replace('#', '');

    if (id) {
        //Prepare the UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) searchView.highLightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render the recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch (err) {
            alert('Error processing the recipe');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// Handles the recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }
    console.log(state.recipe);
});