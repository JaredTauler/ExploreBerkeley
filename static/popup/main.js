class Popup
{
    constructor()
    {
        this.modal = document.getElementById("Popup");
        this.modal.onclick = this.Close.bind(this)
        this.modal.ontouchstart = this.Close.bind(this)
    }
    Show () {
        this.modal.style.display = "grid";
    }

    Text(str)
    {
        document.getElementById("modal-text").textContent = str
    }

    Close()
    {
        console.log(this)
        this.modal.style.display = "none";
    }

}

