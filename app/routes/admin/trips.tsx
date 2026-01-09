import { PagerComponent } from '@syncfusion/ej2-react-grids'
import { Header, Tripcard } from 'components'
import React, { useState } from 'react'
import type { Route } from './+types/trips'
import { getAllTrips } from '~/appwrite/trips'
import { parseTripData } from '~/lib/utils'
import { useSearchParams } from 'react-router'

export const loader = async ({ request }: Route.LoaderArgs) => {
    const limit = 8;
    // console.log(request, "loader request")
    const url = new URL(request.url);  //. 'http://localhost:5173/trips?page=2' (put in new URL to call searchParams)
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const offset = (page - 1) * limit;
    const { allTrips, total } = await getAllTrips(limit, offset);

    return {
        trips: allTrips.map(({ $id, tripDetails, imageUrls }) => ({
            id: $id,
            ...parseTripData(tripDetails),
            imageUrls: imageUrls ?? []
        })),
        total
    }

}

// second param of parseInt (number, radix) 
// | Radix | Meaning     | Example                      |
// | ----- | ----------- | ---------------------------- |
// | `2`   | Binary      | `parseInt("101", 2)` → `5`   |
// | `8`   | Octal       | `parseInt("10", 8)` → `8`    |
// | `10`  | Decimal     | `parseInt("10", 10)` → `10`  |
// | `16`  | Hexadecimal | `parseInt("FF", 16)` → `255` |


const Trips = ({ loaderData }: Route.ComponentProps) => {
    const { trips, total } = loaderData;

    const [searchParams] = useSearchParams();
    const initialPage = Number(searchParams.get('page') || '1');

    const [currentPage, setCurrentPage] = useState<number>(initialPage);
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.location.search = `?page=${page}`;
    }

    return (
        <main className="all-users wrapper">
            <Header
                title="Trips"
                description="View and edit AI-generated travel plans"
                ctaText="Create a trip"
                ctaUrl="/trips/create"
            />

            <section>
                <h1 className="p-24-semibold text-dark-100 mb-4">
                    Manage Created Trips
                </h1>

                <div className="trip-grid mb-4">
                    {trips.map((trip) => (
                        <Tripcard
                            key={trip.id}
                            id={trip.id}
                            name={trip.name ?? "Untitled Trip"}
                            imageUrl={trip.imageUrls[0]}
                            location={trip.itinerary?.[0]?.location ?? ""}
                            tags={[trip?.interests, trip?.travelStyle].filter(Boolean) as string[]}
                            price={trip.estimatedPrice ?? "Unlisted Price"}
                        />
                    ))}
                </div>

                <PagerComponent
                    totalRecordsCount={loaderData.total}
                    pageSize={8}
                    currentPage={currentPage}
                    click={(args) => handlePageChange(args.currentPage)} //.{currentPage: 3, newProp: {…}, oldProp: {…}, cancel: false, isInteracted: true, …}
                    cssClass="!mb-4"
                />
            </section>
        </main>
    )
}

export default Trips
