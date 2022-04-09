// Navigation button thingy.
{
    let NavDropdown = document.getElementById("NavDropdown")
    // On click, show options
    NavDropdown.addEventListener("click", function () {
        NavDropdown.classList.toggle("active")
    })
    // when mouse leaves div, no more showing of options.
    NavDropdown.addEventListener("mouseleave", function () {
        NavDropdown.classList.remove("active")
    })
}
