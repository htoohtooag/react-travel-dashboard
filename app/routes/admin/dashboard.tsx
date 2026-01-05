import { Header, StatsCard, Tripcard } from 'components'
import { dashboardStats, user, allTrips } from '~/constants'


const dashboard = () => { 
  
  const {totalUsers, usersJoined, totalTrips, tripsCreated, userRole} = dashboardStats;

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