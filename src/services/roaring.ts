import { getCompanyOverviewCollection, getPopulationRegisterCollection } from "@/lib/db";
import { DBRoaringCompanyOverview, DBRoaringPopulationRegister } from "@/lib/db.type";
import { swedishCompanyOverviewSearch, swedishPopulationRegisterSearch } from "@/lib/roaring";
import { RoaringCompanyOverviewRecords, RoaringPopulationRegisterRecord } from "@/lib/roaring.type";
import { ObjectId } from "mongodb";


export async function retrieveLatestPopulationRegisterFromDb(personalNumber: string) {
    const popCol = await getPopulationRegisterCollection();
    const populationRegister = await popCol
        .find({ personalNumber: personalNumber })
        .sort({ createDate: -1 }) // Sort by createDate descending (latest first)
        .limit(1)
        .toArray();
    
    return populationRegister[0] || null;
}

export async function savePopulationRegisterToDb(personalNumber: string, records: RoaringPopulationRegisterRecord[]){
    const popCol = await getPopulationRegisterCollection();

    const popRecord: DBRoaringPopulationRegister = {
        _id: new ObjectId().toHexString(),
        personalNumber: personalNumber,
        records: records,
        createdAt: new Date()
    }

    const insertResult = await popCol.insertOne(popRecord)

    if(!insertResult.acknowledged){
        throw new Error("Failed to save population register to DB.")
    }

    console.log('Population register of (' + personalNumber + ') has saved to DB.')
    return popRecord
}

export async function getPopulationRegister(personalNumber: string): Promise<RoaringPopulationRegisterRecord[] | null>{
    const cached = await retrieveLatestPopulationRegisterFromDb(personalNumber)
    if(cached){
        console.log('Cache HIT(population register): ' + personalNumber)
        return cached.records
    }

    const popRegister = await swedishPopulationRegisterSearch(personalNumber)
    
    if(popRegister){
        try{
            await savePopulationRegisterToDb(personalNumber, popRegister)
        }catch(e){
            console.log('Save Failed, Message: ' + (e as Error).message)
        }
    }

    return popRegister
}



export async function retrieveLatestCompanyOverviewFromDb(orgNumber: string) {
    const comCol = await getCompanyOverviewCollection();
    const companyOverview = await comCol
        .find({ orgNumber: orgNumber })
        .sort({ createDate: -1 }) // Sort by createDate descending (latest first)
        .limit(1)
        .toArray();
    
    return companyOverview[0] || null;
}

export async function saveCompanyOverviewToDb(orgNumber: string, records: RoaringCompanyOverviewRecords[]){
    const comCol = await getCompanyOverviewCollection();

    const comRecord: DBRoaringCompanyOverview = {
        _id: new ObjectId().toHexString(),
        orgNumber: orgNumber,
        records: records,
        createdAt: new Date()
    }

    const insertResult = await comCol.insertOne(comRecord)

    if(!insertResult.acknowledged){
        throw new Error("Failed to save company overview to DB.")
    }

    console.log('Company overview of (' + orgNumber + ') has saved to DB.')
    return comRecord 
}

export async function getCompanyOverview(orgNumber: string): Promise<RoaringCompanyOverviewRecords[] | null>{
    const cached = await retrieveLatestCompanyOverviewFromDb(orgNumber)
    if(cached){
        console.log('Cache HIT(company overview): ' + orgNumber)
        return cached.records
    }

    const comOverview = await swedishCompanyOverviewSearch(orgNumber)
    
    if(comOverview){
        try{
            await saveCompanyOverviewToDb(orgNumber, comOverview)
        }catch(e){
            console.log('Save Failed, Message: ' + (e as Error).message)
        }
    }

    return comOverview 
}