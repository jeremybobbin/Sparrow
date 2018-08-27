const dao = require('../../models/Dao');


describe("DataBase", () => {
    it('should query without an error', ()=>{
        dao.query('SELECT 1 + 1 AS result;')
            .then(({results}) => expect(results[0].result).toBe(2));
    });
    
    it('should format query strings', () => {
        dao.query('SELECT ? + ? AS result;', [1, 1])
            .then(({results}) => expect(results[0].result).toBe(2));
    });
});