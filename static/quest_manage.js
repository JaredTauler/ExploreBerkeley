let popup = new Popup()
let CurrentRow = null

var table = new Tabulator
(
    "#Table",
    {
        height: "311px",
        columns: [
            {field: "id", visible: false},
            {title: "Name", field: "name"},
            {title: "Task", field: "task"},
            {title: "Info", field: "info"}
            // {title:"Rating", field:"rating"},
            // {title:"Favourite Color", field:"col"},
            // {title:"Date Of Birth", field:"dob", hozAlign:"center"},
        ]
    }
);

let EditForm = document.getElementById("EditForm")
table.on('rowClick', (e, row) =>
{
    CurrentRow = {}
    for (let i of Object.entries(row.getData()))
    {
        CurrentRow[i[0]] = i[1]
        let elem = EditForm.querySelector("[name='" + i[0] + "']")
        if (elem)
        {
            elem.value = i[1]
        }
    }
})
console.log(document.getElementById("QRcode"))

function MakeQRCode()
{
    let id = CurrentRow["id"] // This is assuming ID is first value
    let link = window.location.host.concat("/quest?id=", id.toString())

    let elem = {}
    for (let i of ["code", "name", "link"])
    {
        elem[i] = popup.modal.querySelector("[id='" + i + "']")
    }

    elem.name.text = CurrentRow.name
    elem.link.text = link

    elem.code.innerHTML = ""
    var qrcode = new QRCode(elem.code, {
        text: link,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });


    popup.Show()
}

//trigger AJAX load on "Load Data via AJAX" button click
function PopulateTable()
{
    table.setData("/quest_manage/ajax");
    return false
}

function Save()
{
    let formdata = new FormData(EditForm)
    if (CurrentRow != null) {
        formdata.append("id", CurrentRow.id)
        formdata.append("intent", "save")
    }
    else {
        formdata.append("intent", "new")
    }
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (this.readyState === 4)
        {
            response = JSON.parse(xhttp.response)
            if (this.status === 200)
            {
                if (response[0] === "pass")
                {
                }
            }
        }
    };

    xhttp.open("POST", window.location.href, true);
    xhttp.send(formdata);
    return false
}

function New()
{
    CurrentRow = null
}
