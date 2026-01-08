import { Header, StatsCard, Tripcard } from 'components'
import { getUser } from '~/appwrite/auth';
import { dashboardStats, allTrips } from '~/constants'
import type { Route } from './+types/dashboard';
import { useRouteLoaderData } from 'react-router';

export const clientLoader = async () => await getUser();


const dashboard = ({loaderData}: Route.ComponentProps) => { 
  //=> Mehtod 1 (data loading same component can callback with loaderdata (data Loading) )
  const {totalUsers, usersJoined, totalTrips, tripsCreated, userRole} = dashboardStats;
  const user = loaderData as User | null;

  //?=> method 2 (with useRouteLoaderData)
  //note we have to pass the id in the routes.ts file
  // const user = useRouteLoaderData("admin-layout") as User | null; 
  //! in that we can use the useLoaderData like in Navitems.tsx (because that componet is in the layoutcomport , that dashboard is on the child outliet com can not pass data so use "useRouteLoader")
 
  return (
    <div className='dashboard wrapper'>
      <Header 
        title={`Weclome ${user?.name ?? "Guest"}`}
        description= "Track activity ,trends and popular destination real time"
      />
      <section className='flex flex-col gap-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
          <StatsCard 
            headerTitle= "Total Users"
            total={totalUsers}
            currentMonthCount={usersJoined.currentMonth}
            lastMonthCount={usersJoined.lastMonth} 
          />
           <StatsCard 
            headerTitle= "Total Users"
            total={totalTrips}
            currentMonthCount={tripsCreated.currentMonth}
            lastMonthCount={tripsCreated.lastMonth} 
          />
          <StatsCard 
            headerTitle= "Total Users"
            total={userRole.total}
            currentMonthCount={userRole.currentMonth}
            lastMonthCount={userRole.lastMonth} 
          />
        </div>
      </section>
      <section className='container'>
        <h1 className='text-xl font-semibold'> Created Trips</h1>
        <div className='trip-grid'>
          {allTrips.slice(0,4).map(({id, name, imageUrls, itinerary, tags, estimatedPrice}) => (
            <Tripcard 
              key={id}
              id={id.toString()}
              name={name}
              imageUrl={imageUrls[0]}
              location={itinerary?.[0]?.location ?? ""}     
              tags={tags}
              price={estimatedPrice}      
              />
          ))}
        </div>
      </section>
    </div>
  )
}

export default dashboard
 

// ??  = is this missing 
// ||  = is this false / empty / zero / missing  (or) 
// &&  = Should i continue ? 

//=>  ?? = (check only null and undefined) 
// a ?? b 
// if a is "null or undefined" -> use b 
// otherwise                   -> use a  
 
//=> ||  (or) 
// a || b 
// if a is "falsy (false, 0, "", null, undefined, NaN)" -> use b 
// otherwise     -> use a