import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  //create instance of a ticket
  const ticket = Ticket.build({
    title: "first ticket",
    price: 200,
    userId: "123",
  });

  //save ticket to db
  //mpngoose, updateIfCurrentPlugin will assign version prop to it
  await ticket.save();

  //fetch ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  //make changes to the 2 instances
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 50 });

  //save the first fetched instance of ticekt
  await firstInstance!.save();

  //save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    console.log(err);
    return;
  }

  throw new Error("Should not reach this point");
});

it("increment version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "Ticket",
    price: 200,
    userId: "1234",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
