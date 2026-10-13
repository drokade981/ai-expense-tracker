import { tool } from "langchain";
import { DatabaseSync } from "node:sqlite";
import z from "zod";

export function initTools(database: DatabaseSync) {
    /**
     * Add expense tool
     */
    const addExpense = tool(
        ({ title, amount }  : { title: string, amount: number }) => {
            console.log({ title, amount });
            const date = new Date().toISOString().split('T')[0];
            const stmt = database.prepare(
                `INSERT INTO expenses(title, amount, date) VALUES(?, ?, ?)`,
            );

            stmt.run(title, amount, date);
            return JSON.stringify({ status: 'success' })
        },
        {
            name: 'add_expense',
            description: `Add the expense to database`,
            schema: z.object({
                title: z.string().describe('The title of expense'),
                amount: z.number().describe('The amount spent'),
            })
        }
    )

    /**
     * Get expense tool
     */

    const getExpenses = tool(
        ({ from, to }: { from: string, to: string }) => {
            console.log({ from, to });
            const stmt = database.prepare(
                `SELECT * from expenses where date between ? AND ?`,
            );
            const rows = stmt.all(from, to);
            console.log('rows', rows)
            return JSON.stringify( rows)
        },
        {
            name: 'get_expenses',
            description: `Get the expenses from database for the given range`,
            schema: z.object({
                from: z.string().describe('start date in YYYY-MM-DD format'),
                to: z.string().describe('end date in YYYY-MM-DD format'),
            })
        }
    )

    /**
     * Generate chart
     */

    const generateChart = tool(
        ({ from , to, groupBy }: { from: string, to: string, groupBy: string }) => {
            
            // forma yyyy-mm-dd ->month -> 2026-11-26 -> 2026-11
            let groupByQuery: string;

            switch (groupBy) {
                case 'month' :
                    groupByQuery = `strftime('%Y-%m', date)`;
                    break;
                
                case 'week':
                    groupByQuery = `strftime('%Y-W%W', date)`; //2026-W26
                    break;
                case 'date':
                    groupByQuery = 'date';
                    break;
                default:
                    groupByQuery = `strftime('%Y-%m', date)`;
            }

            const query =  `SELECT ${groupByQuery} as period, SUM(amount) as total from expenses where date between ? AND ? GROUP BY period
            ORDER BY period`;
            const stmt = database.prepare(query);
            const rows = stmt.all(from, to);
            console.log('rows', rows);
            const result = rows.map((row : any) => {
                return {
                    [groupBy]: row.period,
                    amount: row.total
                }
            })
            return JSON.stringify( {type: 'chart', data: result, labelKey: groupBy });
        },
        {
            name: 'generate_expense_chart',
            description: `Generate expenses chart by quering the database and grouping expenses by month, week or date`,
            schema: z.object({
                from: z.string().describe('start date in YYYY-MM-DD format'),
                to: z.number().describe('end date in YYYY-MM-DD format'),
                groupBy: z.enum(['month', 'week', 'date']).describe('How to group the data by month, week or date')
            })
        }
    )

    return [addExpense, getExpenses, generateChart];
}

