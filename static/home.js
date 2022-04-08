var DoneTable = new Tabulator
(
    "#DoneTable",
    {
        layout:"fitColumns",
        columns: [

            {field: "ticket.id", visible: false},
            {title: "Completed", field: "quest.name"},
            {visible: false, field: "quest.info"}
        ]
    }
);
var NotDoneTable = new Tabulator
(
    "#NotDoneTable",
    {
        layout:"fitColumns",
        columns: [

            {field: "id", visible: false},
            {title: "Uncompleted", field: "name"},
            {visible: false, field: "info"}
        ]
    }
);

let popup = new Popup()
let CurrentRow = null

// Redirect on row click
NotDoneTable.on('rowClick', (e, row) =>
{
    CurrentRow = {}
    for (let i of Object.entries(row.getData()))
    {
        CurrentRow[i[0]] = i[1]
    }

    let elem = {}
    for (let i of ["name", "task", "info", "link"])
    {
        elem[i] = popup.modal.querySelector("[id='" + i + "']")
    }

    elem.name.textContent = CurrentRow.name
    elem.task.textContent = CurrentRow.task
    elem.info.textContent = CurrentRow.info

    let data = Object.entries(row.getData())
    let id = data[0][1] // Assume that this is quest ID.
    let link = "/quest?id=" + id.toString() // Stolen from quest manage.
    // window.location.href = link
    console.log(elem)
    elem.link.href = link

    popup.Show()
})

function PopulateTable()
{
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (this.readyState === 4)
        {
            response = JSON.parse(xhttp.response)
            if (this.status === 200)
            {
                console.log(response)
                DoneTable.setData(response["done"]);
                NotDoneTable.setData(response["notdone"]);
            }
        }
    };

    xhttp.open("POST", window.location.href, true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(
        JSON.stringify(
            {
                "intent": "get_info"
            }
        )
    );
    return false
}
PopulateTable()
