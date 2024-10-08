import { test, expect } from 'playwright-test-coverage';

test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
        const loginReq = { email: 'a@jwt.com', password: 'admin' };
        const loginRes = { user: { id: 2, name: '常用名字', email: 'a@jwt.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
        expect(route.request().method()).toBe('PUT');
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ json: loginRes });
    });

    await page.route('*/**/api/franchise/?', async (route) => {
        //get stores (empty)
        const getStoresRes = [
            {
                "id": 34,
                "name": "test",
                "admins": [
                    {
                        "id": 2,
                        "name": "常用名字",
                        "email": "a@jwt.com"
                    }
                ],
                "stores": []
            }
        ]
        expect(route.request().method()).toBe('GET');
        await route.fulfill({json: getStoresRes});
    });

    await page.route('*/**/api/franchise', async (route) => {

        //create franchise
        if(route.request().method() === 'POST'){
            const createFranchiseReq = {admins: [{email: "a@jwt.com"}], name:"test", stores: []};
            const createFranchiseRes = {stores: [], name: "test", admins: [{email: "a@jwt.com", id: "2", name: "常用名字"}], id: "3"};
            expect(route.request().method()).toBe('POST');
            expect(route.request().postDataJSON()).toMatchObject(createFranchiseReq);
            await route.fulfill({json: createFranchiseRes});
        }
        //see all franchises
        else if(route.request().method() === 'GET'){
            const getFranchiseRes = [{
                "id": 2,
                "name": "test",
                "admins": [{email: "a@jwt.com", id: "2", name: "常用名字"}],
                "stores": []
            }]
            expect(route.request().method()).toBe('GET');
            await route.fulfill({json: getFranchiseRes});
        }
    });

    await page.route('*/**/api/franchise/*/store', async (route) =>{
        expect(route.request().method()).toBe('POST');
        const createStoreReq = {name: 'Test Store'};
        const createStoreRes = {id: "1", franchiseId: "2", name: "Test Store"};
        expect(route.request().postDataJSON()).toMatchObject(createStoreReq);
        await route.fulfill({json: createStoreRes});
    });

    await page.route('*/**/api/franchise/*/store/?', async (route) =>{
        expect(route.request().method()).toBe('DELETE');
        const createStoreRes = {message: "store deleted"};
        await route.fulfill({json: createStoreRes});
    });
});

test('login with admin, create franchise, create store, delete store', async ({page}) =>{
    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByPlaceholder('Email address').fill('a@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('button', { name: 'Add Franchise' }).click({force: true});
    await page.getByPlaceholder('franchise name').click();
    await page.getByPlaceholder('franchise name').fill('test');
    await page.getByPlaceholder('franchisee admin email').click();
    await page.getByPlaceholder('franchisee admin email').fill('a@jwt.com');
    await expect(page.getByText('Create franchise', { exact: true })).toBeVisible();
    await expect(page.getByText('Want to create franchise?')).toBeVisible();
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('cell', { name: 'test', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: '常用名字' }).first()).toBeVisible();
    await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
    await expect(page.getByText('test')).toBeVisible();
    await expect(page.getByText('Everything you need to run an JWT Pizza franchise. Your gateway to success.')).toBeVisible();
    await page.getByRole('button', {name: 'Create store'}).click();
    await page.getByPlaceholder('store name').click();
    await page.getByPlaceholder('store name').fill('Test Store');
    await page.getByRole('button', { name: 'Create' }).click();
    //await expect(page.getByRole('cell', { name: 'Test Store' })).toBeVisible();
    // await page.getByRole('button', { name: 'Close' }).click();
    // await expect(page.getByText('Sorry to see you go')).toBeVisible();
    // await page.getByRole('button', { name: 'Close' }).click();
    // await expect(page.getByRole('cell', { name: 'Test Store' })).not.toBeVisible()
  });