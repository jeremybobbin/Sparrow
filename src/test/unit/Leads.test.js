const Leads = require('../../models/Leads');
const Lead = require('../../models/Lead');

let lead = new Lead(6, '13.231.975.22', 'Jeremy', 'TopGuy', 'jeremybobbin@gmail.com', 'Florlando', 'Oregon', 'USA', new Date());
describe("Leads", () => {
    it('should post a lead', () => {
        return Leads.post(lead)
            .then(({insertId}) => expect(insertId).toBeDefined());
    });

    it('should delete a lead', () => {
        return Leads.post(lead)
            .then(r => Leads.delete(r.insertId))
            .then(({insertId}) => expect(insertId).toBeDefined());
    });

    it('should count leads', () => {
        return Leads.count('https://www.google.com')
            .then(r => expect(typeof r).toBe('number'));
    });
});