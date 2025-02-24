export const userColumns = [
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "user",
    headerName: "User",
    width: 230,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img
            className="cellImg"
            src={params.row.img || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
            alt="avatar"
          />
          {params.row.username}
        </div>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 230,
  },
  {
    field: "createdAt",
    headerName: "Date Created",
    width: 230,
  },

  {
    field: "isAdmin",
    headerName: "Admin",
    width: 100,
  },
];
export const hostelColumns = [
  { field: "_id", headerName: "ID", width: 250 },
  {
    field: "title",
    headerName: "Title",
    width: 150,
  },
  {
    field: "price",
    headerName: "Price",
    width: 100,
  },
  {
    field: "address",
    headerName: "Address",
    width: 230,
  },
  {
    field: "city",
    headerName: "City",
    width: 100,
  },
  {
    field: "bedroom",
    headerName: "Bedroom",
    width: 100,
  },
  {
    field: "bathroom",
    headerName: "Bathroom",
    width: 100,
  },
  {
    field: "latitude",
    headerName: "Latitude",
    width: 100,
  },
  {
    field: "longitude",
    headerName: "Longitude",
    width: 100,
  },
  {
    field: "type",
    headerName: "Type",
    width: 100,
  },
  {
    field: "bus",
    headerName: "Bus Stop",
    width: 100,
  },
  {
    field: "restaurant",
    headerName: "Restaurant",
    width: 100,
  },
];

export const roomColumns = [
  { field: "_id", headerName: "ID", width: 70 },
  {
    field: "title",
    headerName: "Title",
    width: 230,
  },
  {
    field: "price",
    headerName: "Price",
    width: 200,
  },
  {
    field: "price",
    headerName: "Price",
    width: 100,
  },
  {
    field: "maxPeople",
    headerName: "Max People",
    width: 100,
  },
];
